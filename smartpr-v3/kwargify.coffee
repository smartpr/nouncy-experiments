window.kwargify = (fn) ->
	names = fn.toString().match(/^function [^\(]*\(([^\)]*)\) {/)[1].split(',').
		map((arg) -> arg.trim()).
		filter (arg) -> arg.length > 0
	(args) ->
		if arguments.length is 1 and $.isPlainObject(args) and Object.keys(args).every((arg) -> arg in names)
			fn.apply @, (args[name] for name in names)
		else
			fn.apply @, arguments
