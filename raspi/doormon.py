#!/usr/bin/python

# External module imports
import RPi.GPIO as GPIO
import time
import psycopg2
from datetime import timedelta
from datetime import datetime

# Pin Definitons:
beamPin = 17
relayPin = 18 

# DB Table layout constants
ID = 0
DOOR_STATE = 1
REQUESTED_DOOR_STATE = 2
REQUESTED_ON = 3
LAST_CHANGED = 4
ERROR_STATE = 5

def connect(connectionString):
    """Connect to the postgres server
    :param connectionString: postgres parameters for connecting to db
    :return: psycopg2 connection
    """
    conn = None
    try:
        # connect to postgres
        print('Connecting to the postgres database...')
        conn = psycopg2.connect(connectionString)
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    return conn


def getDoorState(conn):
    """Get the door state of the garage
    :param conn: psycopg2 connection
    :return door state (integer)
    """
    doorstate = None
    dbCursor = None
    try:
        # get the door state
        dbCursor = conn.cursor()
        dbCursor.execute("SELECT * FROM doorstate WHERE id = 1")
        doorstate = dbCursor.fetchone()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if dbCursor is not None:
            dbCursor.close()
    return doorstate


def setDoorState(conn, newDoorState):
    """Update the current state of the door"""
    dbCursor = None
    try:
        dbCursor = conn.cursor()
        dbCursor.execute("UPDATE doorstate SET door_state = " + str(newDoorState) + ", last_changed = now() WHERE id = 1")
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if dbCursor is not None:
            dbCursor.close()

def setDoorErrorState(conn, newErrorState):
    """Update the error state of the door"""
    dbCursor = None
    try:
        dbCursor = conn.cursor()
        dbCursor.execute("UPDATE doorstate SET error_state = " + str(newErrorState) + ", last_changed = now() WHERE id = 1")
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if dbCursor is not None:
            dbCursor.close()
            

            
def dumpDoorState(doorstate):
    """Dump a door state record"""
    print("door state: " + str(doorstate[DOOR_STATE]))
    print("requested door state: " + str(doorstate[REQUESTED_DOOR_STATE]))
    print("last changed: " + str(doorstate[LAST_CHANGED]))
    print("last request: " + str(doorstate[REQUESTED_ON]))
    print("error state: " + str(doorstate[ERROR_STATE]))
    print


# main sentinel
if __name__ == '__main__':
    # Pin Setup: Broadcom pin-numbering scheme
    GPIO.setmode(GPIO.BCM) 
    GPIO.setup(relayPin, GPIO.OUT)
    GPIO.setup(beamPin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    # Connect to our db and get the latest stored door state
    conn = connect("host=localhost dbname=garage user=dave password=password")

    # just some debug to show the initial door state
    doorstate = getDoorState(conn)
    dumpDoorState(doorstate)

    # requests older than 15 seconds are ignored, requests not honored after
    # 90 seconds are considered an error
    maxTimeDelta = timedelta(seconds=15)
    errorTimeDelta = timedelta(seconds=45)
    maxErrorTimeDelta = timedelta(seconds=600)
    
    print("Starting door monitor... Press CTRL+C to exit")
    
    try:
        while 1:
            # essentially we need to poll the db for door state requests (yuck)
            doorstate = getDoorState(conn)
            
            # see if the current door state needs to be updated
            beamDoorState = GPIO.input(beamPin)
            if beamDoorState != doorstate[DOOR_STATE]:
                print("door state needs to be updated: " + str(beamDoorState) + " " + str(doorstate[DOOR_STATE]))
                setDoorState(conn, beamDoorState)
                doorstate = getDoorState(conn)
                dumpDoorState(doorstate)

            # determine how long its been since a request has been made
            timedelta = datetime.now() - doorstate[REQUESTED_ON]

            # has something gone wrong?
            if ((beamDoorState != doorstate[REQUESTED_DOOR_STATE]) and
                (timedelta > errorTimeDelta) and (timedelta < maxErrorTimeDelta) and
                (doorstate[ERROR_STATE] == 0)):
                print("Setting error state on door!")
                setDoorErrorState(conn, 1)

            # check if we need to clear the door error state
            if (beamDoorState == doorstate[REQUESTED_DOOR_STATE]) and (doorstate(ERROR_STATE) != 0):
                print("Clearing error state on door - states match")
                setDoorErrorState(conn, 0)

            # we also want to clear the door error state if the request time exceeds our max interval
            # keep in mind someone else could have changed the door state, so this time window
            # essentially determines the validity of the requested door state attribute
            if (timedelta > maxErrorTimeDelta) and (doorstate[ERROR_STATE] != 0):
                print("Clearing error state on door - request time exceeded")
                setDoorErrorState(conn, 0)
                
            # see if there's been a recent request to change the door state
            # we only want to attempt to change the door state, if the request is "new"
            if timedelta < maxTimeDelta:
                print("Time delta: " + str(timedelta))
                # do we actually need to change anything?
                if beamDoorState != doorstate[REQUESTED_DOOR_STATE]:
                    # attempt to change door state
                    print("Changing door state!")

                    # wait for system to stabilize... This should be the full time it takes
                    # for the door to close (plus some slack). This also prevents spamming
                    # of the button on the app, because we simply ignore all requests for
                    # this period of time
                    time.sleep(30)
            
            # sampling/polling rate
            time.sleep(1)
            
    except KeyboardInterrupt:
        GPIO.cleanup()
    finally:
        if conn is not None:
            conn.close()   

