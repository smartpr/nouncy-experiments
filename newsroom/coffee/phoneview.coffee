return unless window.top is window.self

$('body').append '<div id="phoneview"><iframe frameborder="0" src="#{window.location.href}"></div>'