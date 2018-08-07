Access the Tufts Dining API by calling for an HTTP GET request for the URL: 
https://tuftsdiningdata.herokuapp.com/menus/.  Add on the date to the end of the
URL.  The Date object can be used to get the menus for any given day.  

The XMLHTTP request will return a response text that is a piece of JSON data that
can be parsed.  
	note: the Tufts Menus server often has issues so the validity so we need to
	first check if any day's JSON data is valid.  In this case the app would not
	be able to function properly so a window or a message should be outputted.

Once this has been done a JSON-parsed objects... let's call it "contents" will be
returned.  At this point, the string needs to be parsed and all the elements
(Entree, Vegetarian, Pizza, etc.) will have their food items added to a list.  
Photos of each food item will be associated with a photo (still haven't figured
out how this will be implemented).
Within this list, all the entrees will go into a sorted list where the healthiest
entrees will be at the top the list.

Halls = [Carm, Dewick];
Meals = [Breakfast, Lunch, Dinner];


... will finish Saturday Morning

The command loop for the facebook messenger bot will look something like this:

	while (command != quit)

	{
		if (command == "whats for breakfast(or lunch or dinner)?")
		{
			function Display Food Items ();
		}

		if (command == "what are my healthy options?")
		{
			function Display Healthiest Food Items ();
		}

		if (command == "what are the gluten free options?")
		{
			function Display Gluten Free Options ();
		}
	}

	note: all of the functions will return food items from which (if the user wants), a photo of said food item can be returned.