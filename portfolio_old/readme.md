JSON file explanation

the key 'Name' tells the js to search for all elements with the class 'project_<Name>' and generates the project block from the rest of the info

There are also different types

blocks use the keys Type, Name, Period, Description and Details (optional)

* Type = 0 means it also contains the Suffix and Links key
* Type = 1 means it's only a video with a description and time, using the key Source ipv Image
* Type = 2 means it's an embed, also allowing the keys Suffix and Links, but using the key Embed ipv Image (for it's embed)


How to use the Suffix and Links keys, the Suffix key allows for an extra description, by using '+link' the js replaces it with a link from the Links list

The Links key is a list of links and their title with the keys being 'Text' and 'Url'

The Details key allows for a collapsable list of details, for every entry a list is expected, these can still be length 1, if an entry contains 'resources/' the js turns it into an image

This allows for multiple columns withing every entry in the extra details.


The Period key is a key that tells the date/period of when i made that project, the js heavily interprets it by
turning 0 into no date at all, anything >128 is considered a year and <128 is where it gets interesting.
i assumed that i'm going to have 3 studies and 4 years per study and 4 periods per year,
so it derives MBO/HBO/UNI from dividing Period/16, the year by adding 2025 + floor(Period/4),
and then the period by doing (Period % 4) + 1, and it gives a clean data and where i was in my education at the point of making it.

if the first entry in the details is "$open_in_home" it skips that entry as valid text and automatically opens the entire details section if the url contains "index.html"

There are loads of better ways to do this, this is made to be quick and make the result readable and i'm ok at keeping it this way.
