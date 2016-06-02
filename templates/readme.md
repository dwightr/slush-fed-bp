# <%= appNameSlug %> (<%= appVersion %>)
<%= appDescription %>

## Getting Started

* Install [Node.js](http://nodejs.org/)
* Install [Gulp](http://gulpjs.com/) command line interface `npm install -g gulp`
* Update `package.json` with your project's details
* Install project dependencies by:
  * `cd root/of/this/project/`
  * `npm install`

## During development
run: `gulp dev`

Changes should be made inside `/src/`, any updates you make will be compiled/copied into `/dev/`. You should view your work by navigating to `/dev/*.html` in your browser.

#####BrowserSync
This is an optional extra. You will need to install browser-sync globally `npm install -g browser-sync` to use it.

To use browser sync run: `gulp dev -serve`

## Production builds
run: `gulp prod`

Production ready files will be compiled/copied into `/prod/`

External scripts wrapped in the `<!-- build:js js/bundle.js-->` comment will be replaced by `bundle.js` preserving the load order specified in the HTML file.
````html
<!-- build:js js/bundle.js-->
	<script src="path/to/script-one.js"></script>
	<script src="path/to/script-two.js"></script>
<!-- endbuild -->
````

