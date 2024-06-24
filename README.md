# Garage App
## Overview
Have you ever worried that you left your house and left the garage door open? Now you can close it from your phone. :)

A simple implementation using a raspberri pi, postgres and webapp client to run a garage door opener. Just a fun project that marries the gpio pins in the raspberri pi with some straightforward electronics to control the garage door.

## Components
Using a single detetector, and an electronic switch, we build a fun project that controls the garage door.

Its a cool problem with a single detetector, because there aren't enough states to manage. You either "know" the garage is open, or you "know" the garage is closed. You can keep track of the commands you sent, but the physical state of the door can only be detected in one state (with only one detector).

