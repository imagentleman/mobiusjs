if (Element.prototype.webkitCreateShadowRoot &&
    !Element.prototype.createShadowRoot) {
    Element.prototype.createShadowRoot = Element.prototype.webkitCreateShadowRoot;
}

var root;
var mobius_ready = false;
var delay;
var hover;
var x;
var y;
var shadow_height = 0;
var window_height = 0;
var scrolling = false;
var shadow_scrolling = false;
var last_yper = 0.0;
var request = 0;
var scroll_shadow = false;
var offset = 0;

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations) {
	if ( mobius_ready === true ) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].nodeName !== 'STYLE') {
        window.clearTimeout(delay);
        delay = window.setTimeout(function() {
          repaint();
          if ( shadow_height === 0 ) {
            close();
          }
        }, 3000);
      }
    });
	}
});

function get_style(request) {
	if (request.url && request.url.indexOf(window.location.origin) !== -1) {
    $.get(request.url, function(data) {
      if (data.indexOf('@font-face') === -1) {
	      $('#mobius-castle').append($('<style>').text(data));
      }
    });
  }
}

function repaint() {
	var host = $('#mobius-castle');
	host.css('opacity', '0');
	var body = $('body').clone();
	body.find('#mobius-castle, audio, video, embed, script').remove();
  var styles = $('style').clone();
  body.prepend(styles);
  var sheets = $('link[rel=stylesheet]');

  for (var i=0; i<sheets.length; i++) {
    var response = get_style({url: sheets[i].href});
  }

	var div = $('<div>').css({
		"position": "absolute",
		"left": "0",
		"top": "0",
		"width": document.body.clientWidth,
		"height": document.body.offsetHeight,
		"z-index": "123456790",
		"background-color": "transparent"
	});
	body.append(div);
	root.innerHTML = body.html();

	host.css("opacity", "0.2");

	shadow_height = host.height();
	if ( shadow_height * 0.1 > window_height ) {
		scroll_shadow = true;
		offset_shadow();
	} else {
		scroll_shadow = false;
	}
}

function scroll() {
	if ( scrolling === false ) {
		scrolling = true;
		var y_per = (y + offset) / (shadow_height * 0.1);
		if ( last_yper !== y_per ) {
			$('body').scrollTop(y_per*document.body.scrollHeight);
			scrolling = false;
			request = requestAnimationFrame(scroll);
		} else {
			scrolling = false;
			cancelAnimationFrame(request);
		}
		last_yper = y_per;
	}
}

function start_animation() {
	if ( scrolling === false ) {
		request = requestAnimationFrame(scroll);
	}
}

function offset_shadow() {
	shadow_scrolling = true;
	var y_per = window.scrollY / document.body.scrollHeight;
	var overflow = shadow_height * 0.1 - window_height;

	$('#mobius-castle').css('top', -overflow * y_per);
	offset = overflow * y_per;
	shadow_scrolling = false;
}

function init() {
	mobius_ready = false;
	scrolling = false;
	shadow_scrolling = false;
	scroll_shadow = false;

	observer.observe(document.body, { childList: true, subtree: true });

	var mobius = $('<div>', {
		"id": "mobius-castle"
	}).css({
		"position": "fixed",
		"top": "0",
		"-webkit-transform-origin": "0 0",
		"-webkit-transform": "scale(.1, .1)",
		"left": "0",
		"opacity": "0",
		"z-index": "123456789",
		"cursor": "pointer",
		"overflow": "hidden",
		"background-color": "white",
		"box-shadow": "-3px 0px 36px 0px #444"
	}).hover(function() {
		$(this).css("opacity", "0.8");
		cancelAnimationFrame(request);
	},function() {
		$(this).css("opacity", "0.2");
		cancelAnimationFrame(request);
	});
	$('body').append(mobius);

	var host = $('#mobius-castle');
	root = host[0].createShadowRoot();
	root.applyAuthorStyles = true;
	window_height = $(window).height();
	repaint();
	mobius_ready = true;

	host.css("width", document.body.clientWidth);
	host.css("opacity", "0.2");

	$(window).resize(function() {
		window_height = $(window).height();
		repaint();
		if ( scroll_shadow === true && shadow_scrolling === false && scrolling === false ) {
			offset_shadow();
		}
	});

	$('#mobius-castle').mousemove(function(e) {
		x = e.clientX;
		y = e.clientY;
		start_animation();
	});

	$('#mobius-castle').mouseout(function(e) {
		cancelAnimationFrame(request);
	});

	$(document).scroll(function(e) {
		if ( scroll_shadow === true && shadow_scrolling === false && scrolling === false ) {
			offset_shadow();
		}
	});
}

function close() {
	observer.disconnect();

	$(window).off();
	$(document).off();
	$('#mobius-castle').off();

	$('#mobius-castle').remove();
}

$(document).ready(function() {
	init();
});


$(window).load(function() {
	repaint();
});
