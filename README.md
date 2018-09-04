# hashtag-basic-slider
Simple yet nice react Slideshow Component

demo: [http://dev.mariasturm.com/projects/be-good/info](http://dev.mariasturm.com/projects/be-good/info)

# Usage
~~~
import React from 'react';
import HashtagSlider from '../HashtagSlider/HashtagSlider.jsx';

export default class MyApp extends React.Component {
	render() {
		const settings = {
            speed           : 250,
            initialSlide    : 2,
            afterChange     : this.handleAfterSlide,
            infinite        : false,
        };


        return (
                <HashtagSlider { ...settings }>
			<div>
				first slide
			</div>
			<div>
				second slide
			</div>
			<div>
				third slide
			</div>
                </HashtagSlider>
        );
	}
}
~~~


# Settings
~~~
speed		: Define the speed of slide animation -> 0 for no animation
initialSlide   	: Define where to start
infinite       	: loop / go back to slide 1 after last slide
draggable      	: disable touch/drag
slideshowClass 	: Provide your own class for the slideshow Conainter
~~~

# Callbacks
~~~
afterChange    	: callback after Slide is changed ( slideIndex )
onInit         	: callback after Slideshow initialization
~~~

# Methos
~~~
nextSlide	: go to next Slide
prevSlide	: go to previous Slide
~~~
