# Experience Neauxla

This project was initially designed as part of Jonas Schmedtmann's JavaScript course, in which it was titled "Mapty".

I have redesigned it as an "outing" tracker.  It is designed to track user's outings in New Orleans so they can revisit their favorite places or just quickly see where they've been. This application uses leaflet to display and interact with the map. 

The app is built using JavaScript classes to define not only the app itself, but also the individual tasks.  It was made primarily as a means of practicing the use of classes.

## Directions for Use:
1. Click a location on the map where you would like to add an outing.
2. A form will appear. Select the type of outing you'd like to record from the dropdown menu. The choices are 'dining' or 'music'.
3. Enter your personal rating for the outing. It must be a whole number between 1-10.
4. Enter the resuarant name if recording a 'dining' outing or the venue name if recording a 'music' outing.
5. Enter the cuisine type (Ex. Greek, Creole, Italian, Etc.) if recording a 'dining' outing or the band name if recording a 'music' outing.
6. Record the total cost of your meal rounded to the nearest dollar if recording a 'dining' outing or the duration of the performance if recording a 'music' outing.
7. Record the number of people eating if recording a 'dining' outing or the number of drinks consumed if recording a 'music' outing.
8. Submit

A new outing object will appear and a marker and popup wil be added to the map at the location of the outing.

### To Delete an Outing
1. Simply click the trash can icon in the upper left corner of the outing details. (Be careful, once clicked, the outing is gone.)

All outings will be saved to local memory so that user's can return to see their personal outings.
