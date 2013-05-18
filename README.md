GalleryDivision.js
==================

* Sorry folks, this currently only works in Google chrome, Mozilla Firefox and Safari.  I will make it cross browser compatible when I have a little time, probably within the next week.

Gallery Division Demonstration

That's right folks, this is a demonstration of Gallery Division using combined erasure and slashing.  100% html5, css3 and javascript.

I did this project to help myself review division.  It is more clear then long division in terms of step my step and also more useful as a algorithm for coding.

Feel free to email me bugs, except for the prev (rollback stepper) function as I already know it breaks after steping past the group quotient calculation.

Gallery division follows these steps and rules:

Rules
-----

1. a group quotient calculation is the first step for each group task.
2. a group quotient will be zero for a group divisor of zero.
3. a group quotient will be nine for that if it is greater than 9
4. the quot will be applied to each group place of the dividend / remainder for each group task.
5. on underflow of the remainder the group task will be redone using the group quotient minus one. 

Grammar
-------

* A "group place" is the digit position with in a number which indicates that and left digits as the dividend / remainder. 
* A "group task" is the operation of calculating the quotient and apply it to each group place.
* A "group quotient" is the quotient used for each group task.
* "Erasure" refers to removing / replacing a deprecated group place.
* "Slashing" refers to striking out a deprecated group place.

More information on gallery division can be found at http://en.wikipedia.org/wiki/Galley_division
