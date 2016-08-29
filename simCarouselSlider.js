var simCarouselSlider = (function() {
	var _doc = document,
		_defaults = {
			// ClassNames
			wrapperShortOuterClassName: 'scs_wrapperShortOuter',
			wrapperLongInnerClassName: 'scs_wrapperLongInner',
			contentClassName: 'scs_content',
			radioWrapperClassName: 'scs_radioWrapper',
			radioClassName: 'scs_radio',
			niceRadioClassName: 'scs_niceRadio',

			// Settings
			personalID: new Date().getTime(),
			adjustHeight: true,
			checkedSlideIndex: 0,

			// Callback
			beforeInit: emptyFunction,
			endInit: emptyFunction,

			beforeSlide: emptyFunction,
			slide: emptyFunction,
			endSlide: emptyFunction
		};

	function simCarouselSlider(parentElem, options) {
		if (!(this instanceof simCarouselSlider)) return new simCarouselSlider(parentElem, options);

		this.userOptions = combineDefaults(_defaults, options);
		this.parentElem = parentElem;
		this.content = null; // Can't asign a value now, because we will be changing the DOM of where content is.
		this.wrapperLongInner = _doc.createElement('div');
		this.radioWrapper = _doc.createElement('div');
		this.newIndex = this.userOptions.checkedSlideIndex;
		this.oldIndex = this.newIndex;
		this.contentHeight = [];
		this.contentPadding = [];
		this.singleContentHeight = 0;
		this.singleContentWidth = 0;

		// Bind 'this' to the event functions.
		// See http://stackoverflow.com/a/22870717/4861207
		// for reason why we need to bind it.
		this.radioChangeEventBinded = radioChangeEvent.bind(this);
		this.transitionCallbackBinded = transitionCallback.bind(this);

		var initBinded = init.bind(this);
		initBinded();
	}

	function init() {
		var _this = this,
			_checkedSlideIndex = _this.userOptions.checkedSlideIndex,
			wrapperShortOuter = _doc.createElement('div');
		
		_this.userOptions.beforeInit();

		// Assign designated class names
		wrapperShortOuter.className = _this.userOptions.wrapperShortOuterClassName;
		_this.wrapperLongInner.className = _this.userOptions.wrapperLongInnerClassName;
		_this.radioWrapper.className = _this.userOptions.radioWrapperClassName;

		// Rearange content, and create radio buttons
		while (_this.parentElem.children.length) {
			var currentElem = _this.parentElem.firstElementChild,
                currentElemStyle = window.getComputedStyle(currentElem),
				loopIndex = _this.radioWrapper.children.length / 2,
				radio = _doc.createElement('input'),
				niceRadio = _doc.createElement('label');
			
			// Apply class names.
			// Class names have to be applied before
			// getting offset[direction]
			currentElem.classList.add(_this.userOptions.contentClassName);
			niceRadio.className = _this.userOptions.niceRadioClassName;
			radio.className = _this.userOptions.radioClassName;

			// Add the height of each element to contentHeight
			// if adjustHeight is enabled
			if (_this.userOptions.adjustHeight) _this.contentHeight.push(currentElem.offsetHeight);
			_this.contentPadding.push(currentElemStyle.getPropertyValue('padding'));

			// Get the content element with the largest width
			if (_this.singleContentWidth === 0 || currentElem.offsetWidth > parseInt(_this.parentElem.style.width, 10)) {
				_this.singleContentWidth = currentElem.offsetWidth;
			}
			// Get the content element with the largest height
			if (_this.singleContentHeight === 0 || currentElem.offsetHeight > parseInt(_this.parentElem.style.height, 10)) {
				_this.singleContentHeight = currentElem.offsetHeight;
			}

			if (_checkedSlideIndex === loopIndex) {
				if (_this.userOptions.adjustHeight) _this.wrapperLongInner.style.height = currentElem.offsetHeight + 'px';
				currentElem.style.width = _this.singleContentWidth + 'px';
				radio.checked = true;
			} else {
				currentElem.style.width = 0;
				currentElem.style.padding = 0;
			}

			// Apply attributes
			niceRadio.htmlFor = radio.id = _this.userOptions.personalID + 'sliderRadio' + loopIndex;

			radio.type = 'radio';
			radio.name = _this.userOptions.personalID;
			radio.value = loopIndex;

			// Add event to radio button
			radio.addEventListener('change', _this.radioChangeEventBinded);

			// Append elements
			_this.radioWrapper.appendChild(radio);
			_this.radioWrapper.appendChild(niceRadio);
			_this.wrapperLongInner.appendChild(currentElem);
		}

		// Add CSS Style
		if (_this.userOptions.adjustHeight) _this.wrapperLongInner.style.height = _this.contentHeight[0] + 'px';
		else _this.parentElem.style.height = _this.singleContentHeight + 'px';
		_this.parentElem.style.width = _this.singleContentWidth + 'px';
		_this.wrapperLongInner.style.width = _this.singleContentWidth * 2 + 'px';

		// Add animation callback
		_this.wrapperLongInner.addEventListener('transitionend', _this.transitionCallbackBinded);

		// Add elemnts to DOM
		wrapperShortOuter.appendChild(_this.wrapperLongInner);
		_this.parentElem.appendChild(wrapperShortOuter);
		_this.parentElem.appendChild(_this.radioWrapper);
		
		_this.content = _this.wrapperLongInner.children;
		
		_this.userOptions.endInit();
	}
	
	simCarouselSlider.prototype.getSlideIndex = function() {
		return this.newIndex;
	};
	
	simCarouselSlider.prototype.setSlideIndex = function( /** Number*/ index) {
		var _this = this;
        
		if (typeof index !== 'number' || index === _this.newIndex) return;
		_this.radioChangeEventBinded(index);
        _this.radioWrapper.children[index].checked = true;
	};

	function radioChangeEvent(e) {
		var _this = this;
		_this.userOptions.beforeSlide();
        
		// Disable radio buttons
		for (var i = 0; i < _this.radioWrapper.children.length; i++) {
			_this.radioWrapper.children[i].disabled = true;
		}

		var moveAmount = -_this.singleContentWidth;
		_this.oldIndex = _this.newIndex;
		_this.newIndex = (typeof e === 'object') ? e.target.value : e;
		
		_this.content[_this.newIndex].style.width = _this.singleContentWidth + 'px';

		if (_this.oldIndex > _this.newIndex) {
            _this.wrapperLongInner.style.transition = 'none';
			_this.wrapperLongInner.style.transform = 'translateX(' + moveAmount + 'px)';
			moveAmount = 0;
		}

		setTimeout(function() {
			_this.wrapperLongInner.style.transition = '';
			_this.wrapperLongInner.style.transform = 'translateX(' + moveAmount + 'px)';
			if (_this.userOptions.adjustHeight) _this.wrapperLongInner.style.height = _this.contentHeight[_this.newIndex] + 'px';
			_this.content[_this.oldIndex].style.padding = '0';
			_this.content[_this.newIndex].style.padding = _this.contentPadding[_this.newIndex];
			_this.userOptions.slide(_this.newIndex);
		});
	}

	function transitionCallback(e) {
		var _this = this;
		
		if (e.target !== _this.wrapperLongInner) return;

		_this.wrapperLongInner.style.transition = 'none';
		_this.content[_this.oldIndex].style.width = 0;
		_this.wrapperLongInner.style.transform = 'translateX(0)';

		// Enable the radio buttons
		for (var i = 0; i < _this.radioWrapper.children.length; i++) {
			_this.radioWrapper.children[i].disabled = false;
		}
		_this.userOptions.endSlide(_this.newIndex);
	}

	function combineDefaults(defaultOptions, userOptions) {
		if (typeof defaultOptions !== 'object') return;
		var final = {};

		// Set default options
		userOptions = userOptions || {};
		for (var key in defaultOptions) {
			if (!defaultOptions.hasOwnProperty(key)) continue;
			final[key] = (userOptions[key] || defaultOptions[key]);
		}
		return final;
	}

	function emptyFunction() {}

	simCarouselSlider.create = function(el, options) {
		return new simCarouselSlider(el, options);
	};

	return simCarouselSlider;
})();

/*
var sliderWrapper = document.getElementById('sliderWrapper');
var slider = new simCarouselSlider(sliderWrapper);
*/
