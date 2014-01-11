# ReadiumJS Viewer
Welcome to the ReadiumJS viewer project. This project encapsulates several applications.

  * A basic EPUB viewer
  * A Chrome packaged app for managing an EPUB library and reading EPUBs.
  * A generic EPUB library management and viewer application that requires you to implement your own backend

The viewer is the default viewer for Readium.js, a JS library for rendering EPUB files on any modern browser, via any web server. If you'd like to learn more, check out the ReadiumJS website](http://readium.org/projects/readiumjs), and/or [source on Github](https://github.com/readium/readium-js). ReadiumJS is in early development and it is not yet recommended that you use it for production deployment of EPUB files.

## Getting started
  * [Basic EPUB viewer](#basic-epub-viewer)
  * [Embeddable EPUB Viewer](#embeddable-epub-viewer)
  * [Chrome packaged app](#chrome-packaged-app)
  * [Custom EPUB management system](#custom-epub-management-and-viewer-application)
  * [Running the Tests](#running-the-tests)

### Basic EPUB Viewer

#### Clone into your own web server

To test the ReadiumJS viewer on any static web server: 

   * clone https://github.com/readium/readium-js-viewer.git into a content directory in your web server (e.g. into a "www/readium-js-viewer" folder)
   * for zipped EPUB files support, configure your web server for [HTTP Byte Serving](http://en.wikipedia.org/wiki/Byte_serving) so that Readium.js library can fetch only the necessary portions of a zipped EPUB file that contain content for the displayed page
   * visit yourdomain/readium-js-viewer/simpleviewer.html?epub=epub_content/moby_dick and enjoy! 
   * there is no step three! (but it is not recommended to deploy the build-related files onto a publicly-accessible server)

#### Clone and run an embedded Node.JS web server

To build and run the browser-based version of the js-viewer (as opposed to the Chrome extension), you need to:

* Install Node.JS (details depend on your operating system)
* Install the Grunt Command Line Interface build tool: sudo npm install -g grunt-cli
    * Note that the -g argument instructs npm to install the grunt tool globally (i.e. for everyone)
* Sync to the github repository:
    * git clone --recursive https://github.com/readium/readium-js-viewer.git
    * Be sure to use the --recursive tag since this repo, like all the Launchers and Viewers in the Readium projects, uses submodules.  Without the --recursive flag, the clone will get the folder but not its contents.
* Install the project's dependencies: npm install
    * Note that this must be done twice:
        * In the root folder (e.g. readium-js-viewer)
        * In the readium-js library folder, i.e readium-js-viewer/readium-js
* Run the embedded web server using the Grunt build system: grunt
    * This reads the grunt command file, gruntFile.js
    * Visit http://localhost:8080/simpleviewer.html?epub=epub_content/moby_dick in your browser
* When done, you must terminate the Grunt build process and the embedded web server
    * On Windows, press Ctrl-C
    * On OSX, close the terminal window


One of advantages of the embedded Node.JS + Express web server is that it supports HTTP Byte Serving out of the box, without additional configuration, required for efficient handling of zipped EPUB files.
   
#### Add additional EPUBs

The viewer uses the `epub` url query parameter to find the ebook to display. The project comes with several epubs already (look under the epub_content directory).  To add a new EPUB simply unzip an epub to be anywhere on the same server as the viewer. Example steps: 

   * unzip any <strong>`(*)`</strong> valid <strong>`(**)`</strong> .epub file (EPUB 2 or EPUB 3 version) in the "epub_content" directory
   * navigate to http://localhost:8080/simpleviewer.html?epub=epub_content/new_book_directory

<strong>`(*)`</strong> NOTE1: This is somewhat aspirational; as Readium.js is still in early development not all EPUB 3 features are yet supported in  - see issues trackers for the consituent sub-projects for more info

<strong>`(**)`</strong> NOTE2: "valid" means EPUBCHeck 3.0 reports zero errors. At this time Readium.js does not have robust error handling
   
#### Use the latest Readium.js library version

The Grunt build configuration also contains an optional task that builds the latest versions of Readium.js library files and places them in the `lib/` directory.

Assuming that you have Grunt and project's dependencies already installed (see above), in order to run this task, execute the following command:

    grunt update-readium

### Embeddable EPUB Viewer

You can host an embeddable epub viewer using the same instructions as the [Basic EPUB viewer](#basic-epub-viewer). For example, if you wanted to add epub content to a blog or similar.

Follow the same instructions as setting up the [Basic EPUB viewer](#basic-epub-viewer) then embed the epub reader using an iframe like so

```html
<iframe width="600" height="400" src="http://localhost:8080/simpleviewer.html?epub=epub_content/moby_dick&amp;embedded=true" style="border:1px #ddd solid;" allowfullscreen mozallowfullscreen webkitallowfullscreen></iframe>
```

Note the `embedded=true` query parameter. This adds a special UI and handling for a smaller screen. See the `embed.html` file in the root of the source tree for a complete example that works with the [Basic EPUB viewer](#basic-epub-viewer) setup.


## Chrome Packaged App

To run the Chrome packaged app, you will need to do the following:

* install Node.JS (details depend on your operating system)
* Install the Grunt Command Line Interface build tool:  sudo npm install -g grunt-cli
    * Note that the -g argument instructs npm to install the grunt tool globally (i.e. for everyone)
* Sync to the github repository:
    * git clone --recursive https://github.com/readium/readium-js-viewer.git
        * Be sure to use the --recursive tag since this repo, like all the Launchers and Viewers in the Readium projects, uses submodules.          * Without the --recursive flag, the clone will get the folder but not its contents.
* Install the project's dependencies: npm install
    * Note that this must be done twice:
        * In the root folder (e.g. readium-js-viewer)
        * In the readium-js library folder named readium-js
* Build the application:  grunt chromeApp
* Load the app as an unpacked extension from (project-root)/build/chrome-app. 
    * More detailed information is [here](https://www.google.com/url?q=http%3A%2F%2Fdeveloper.chrome.com%2Fextensions%2Fgetstarted.html%23unpacked)
    * Note that there will be a chrome-app folder in the root folder but that is not the correct folder, the correct folder is in the build subdirectory. 
Open the App in Chrome.


### Custom EPUB management and viewer application
The code that runs the chrome packaged app can also be run on a web server. However, it requires a backend to store and retrieve EPUB files. You would have to implement this yourself. You can see this in action by following the directions to [run a node web server](#clone-and-run-an-embedded-nodejs-web-server) and then navigating to http://localhost:8080/index.html. The backend the example uses is just static files so it doesn't support updating. 

### Running the Tests
The viewer project contains some basic regression tests. These are run using [chromedriver](https://sites.google.com/a/chromium.org/chromedriver/home), [Selenium WebdriverJS](https://code.google.com/p/selenium/wiki/WebDriverJs), and [nodeunit](https://github.com/caolan/nodeunit/). The tests target the chrome packaged app. **Assuming you have already followed the steps above to run the packaged app**, these are the additional steps if you want to run the tests
  
   * Install [chromedriver](https://sites.google.com/a/chromium.org/chromedriver/home) for your platform and ensure it's on your system path somewhere.
   * Install the Google Chrome browser or have it already installed in the default install location for your platform.
   * run `grunt test`



