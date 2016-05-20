# WAKT (WebbApplikation för KonstTaggning)

WAKT is a website used to add or suggest coordinates to public art located in Sweden.    
It is developed as an extension to [offentligkonst.se](offentligkonst.se).

## Documentation

All files are documented in the [Wiki](https://github.com/MVKVT16/WAKT/wiki).

## External libraries

We are using the following external libraries in our project:    
* [Font Awesome](https://fortawesome.github.io/Font-Awesome/) - All icons used are provided by Font Awesome.
* [jQuery](https://jquery.com/) - jQuery provides a large amount of functions that you can't do without. jQuery's Ajax functions in particular are used in almost every script.
* [Sass](http://sass-lang.com/) - A CSS extension language used to write more powerful stylesheets.
* [Leaflet](http://leafletjs.com/) - An interactive map framework.

## API

* [Offentligkonst.se / ÖDOK](http://offentligkonst.se/api/) - All artwork data
* [MediaWiki](https://www.mediawiki.org/wiki/API:Main_page) - Publishing to Wikipedia
* [OpenStreetMap](http://wiki.openstreetmap.org/) - Map tiles

## Build

We are using the preprocessor from [sass-lang](http://sass-lang.com) to preprocess all SASS files to CSS.    
The files are minimized by [Gulp](http://gulpjs.com) before being uploaded to the server.

## Testing

Unit tests are not implemented yet.

We intended to use the following frameworks to implement unit testing.
Unfortunately some issues occurred while trying these and we would like to encourage that these are implemented.

Most of them rely on [node.js](https://nodejs.org/en/):
- [Mocha](https://mochajs.org)
- [Selenium](http://www.seleniumhq.org)

These may have some semantic sugar and extra functionality:
- [Chai](http://chaijs.com)
- [Sinon](http://sinonjs.org) more advanced for ajax testing
