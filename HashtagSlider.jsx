import React from 'react';
import PropTypes from 'prop-types';

// Global Var for Dragging to save drag start point
let x0 = null;

// Global Var for Track offset
let trackOffsetLeft = 0;

export default class HashtagSlider extends React.Component {
    static propTypes = {
        speed           : PropTypes.number, // speed of slide animation -> 0 for no animation
        afterChange     : PropTypes.func,   // callback after Slide is changed ( slideIndex )
        onInit          : PropTypes.func,   // callback after Slideshow initialization
        initialSlide    : PropTypes.number,
        infinite        : PropTypes.bool,   // loop / go back to slide 1 after last slide
        children        : PropTypes.arrayOf( PropTypes.object ), // slides
        draggable       : PropTypes.bool,   // offer possibility to disable touch/drag
        slideshowClass  : PropTypes.string,
    };

    static defaultProps = {
        speed           : 0,
        infinite        : false,
        draggable       : true,
        slideshowClass  : 'slideshow',
    };

    constructor( props ) {
        super( props );

        this.trackRef = React.createRef();

        this.state = {
            slideIndex  : this.props.initialSlide || 0,
        };
    }

    /**
     * add together all slides width until current
     *
     * @param {Array} slides
     * @param {Number} slideIndex
     *
     * @return {Number} negative total width of the slides
     */
    calculateOffsetLeft = ( slides, slideIndex ) => {

        let offsetLeft = 0;

        for ( let i = 0; i < slideIndex; i++ ) {
            offsetLeft += slides[ i ].clientWidth;
        }

        return offsetLeft * -1;

    }

    /**
     * add together all slides width
     *
     * @param {Array} slides
     *
     * @return {Number} width
     */
    calculateTrackWidth = ( slides ) => {
        let trackWidth = 0;

        for ( let b = 0; b < slides.length; b++ ) {
            trackWidth += slides[ b ].clientWidth;
        }

        return trackWidth;
    }

    /**
     * unify the touch and click cases
     *
     * @param {Object} event
     *
     * @return {Object} event
     */
    unify = ( event ) => {
        return event.changedTouches ? event.changedTouches[ 0 ] : event;
    }

    /**
     * get and store the x coordinate into an global coordinate variable x0
     *
     * @param {Object} event
     */
    lock = ( event ) => {
        x0 = this.unify( event ).clientX;
    }

    /**
     * read the current x coordinate, compute the difference between it and x0
     * and delegate slideshow command
     *
     * @param {Object} event
     */
    move = ( event ) => {
        const trackRef = this.trackRef.current;
        const dragThreshold = trackRef.parentNode.clientWidth / 4;

        if ( x0 || x0 === 0 ) {
            const dx = this.unify( event ).clientX - x0;
            const direction = Math.sign( dx );

            const positiveDx = dx > 0 ? dx : dx * -1;

            if ( positiveDx > dragThreshold ) {
                if ( direction < 0 ) this.nextSlide();
                if ( direction > 0 ) this.prevSlide();
            } else {
                trackRef.style.transform = `translateX(${trackOffsetLeft}px)`;
            }

            x0 = null;
        }
    }

    /**
     * Move Track with mouse
     *
     * @param {Object} event
     */
    drag = ( event ) => {

        const trackRef = this.trackRef.current;

        event.preventDefault();

        if ( ( x0 || x0 === 0 ) && trackRef ) {

            const touchOffset = Math.round( this.unify( event ).clientX - x0 );

            const tempTrackOffsetLeft = trackOffsetLeft + touchOffset;

            trackRef.style.transform = `translateX(${tempTrackOffsetLeft}px)`;
        }
    }

    componentDidMount() {

        const trackRef = this.trackRef.current;
        const { slideIndex } = this.state;
        const { onInit, draggable } = this.props;

        if ( !trackRef ) return;

        // Get Slide Elements
        const slides = trackRef.childNodes;

        if ( !slides ) return;

        // Get Track Width
        const trackWidth = this.calculateTrackWidth( slides );

        // Set Track Width
        trackRef.style.width = `${trackWidth}px`;

        // Get Offset
        trackOffsetLeft = this.calculateOffsetLeft( slides, slideIndex );

        // Set Offset
        trackRef.style.transform = `translateX(${trackOffsetLeft}px)`;


        // If draggable is enabled, add events
        if ( draggable ) {
            trackRef.addEventListener( 'mousedown', this.lock, false );
            trackRef.addEventListener( 'touchstart', this.lock, false );

            trackRef.addEventListener( 'mouseup', this.move, false );
            trackRef.addEventListener( 'touchend', this.move, false );

            trackRef.addEventListener( 'touchmove', e => { e.preventDefault(); }, false );

            trackRef.addEventListener( 'mousemove', this.drag, false );
            trackRef.addEventListener( 'touchmove', this.drag, false );
        }

        // onInit callback
        if ( onInit ) onInit();

    }

    componentWillUnmount() {

        const { draggable } = this.props;
        const trackRef = this.trackRef.current;

        if ( trackRef &&  draggable ) {
            trackRef.removeEventListener( 'mousedown', this.lock, false );
            trackRef.removeEventListener( 'touchstart', this.lock, false );

            trackRef.removeEventListener( 'mouseup', this.move, false );
            trackRef.removeEventListener( 'touchend', this.move, false );

            trackRef.removeEventListener( 'touchmove', e => { e.preventDefault(); }, false );

            trackRef.removeEventListener( 'mousemove', this.drag, false );
            trackRef.removeEventListener( 'touchmove', this.drag, false );
        }
    }

    componentDidUpdate() {

        const trackRef = this.trackRef.current;
        const { slideIndex } = this.state;
        const { afterChange } = this.props;

        if ( !trackRef ) return;

        const slides = trackRef.childNodes;

        if ( !slides ) return;

        trackOffsetLeft = this.calculateOffsetLeft( slides, slideIndex );

        trackRef.style.transform = `translateX(${trackOffsetLeft}px)`;


        if ( afterChange ) afterChange( slideIndex );

    }

    nextSlide = () => {

        const { infinite } = this.props;
        const { slideIndex } = this.state;
        const slides = this.props.children;

        const afterLastIndex = infinite ? 0 : slides.length - 1;

        const nextSlide = slideIndex + 1 < slides.length ? slideIndex + 1 : afterLastIndex;

        this.setState( { slideIndex : nextSlide } );

    }

    prevSlide = () => {

        const { infinite } = this.props;
        const { slideIndex } = this.state;
        const slides = this.props.children;

        const beforeFirstIndex = infinite ? slides.length - 1 : 0;

        const prevSlide = slideIndex - 1 >= 0 ? slideIndex - 1 : beforeFirstIndex;

        this.setState( { slideIndex : prevSlide } );

    }

    render() {
        const { speed, slideshowClass } = this.props;
        const slides = this.props.children;

        const slideshowStyles = {
            width       : '100%',
            height      : '100%',
            overflow    : 'hidden',
        };

        const trackStyles = {
            transition      : `transform ${speed}ms`,
            display         : 'flex',
            height          : '100%',
        };

        return (
            <div className={ slideshowClass } style={ slideshowStyles }>
                <div ref={ this.trackRef } style={ trackStyles }>
                    { slides }
                </div>
            </div>
        );
    }
}
