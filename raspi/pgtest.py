#!/usr/bin/python

# module imports
import psycopg2
from datetime import timedelta

# DB Table layout constants
ID = 0
DOOR_STATE = 1
REQUESTED_DOOR_STATE = 2
REQUESTED_ON = 3
LAST_CHANGED = 4

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
    """Get the door state of the garage"""
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
    print


# main sentinel
if __name__ == '__main__':
    conn = connect("host=localhost dbname=garage user=dave password=password")
    setDoorState(conn, 0)
    doorstate = getDoorState(conn)
    dumpDoorState(doorstate)

    maxtimedelta = timedelta(seconds=30)
    dif = doorstate[REQUESTED_ON] - doorstate[LAST_CHANGED]

    if dif > maxtimedelta:
        print("door state exceeds max delta")

    if conn is not None:
        conn.close()
