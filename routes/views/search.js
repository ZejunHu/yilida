var keystone = require("keystone");
var async = require("async");

exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.filters = {
		keywords: req.query.keywords
	};
	locals.data = {
		posts: [],
		categories: [],
		keywords: "",
		invalid: ""
	};

	// Load all categories
	view.on("init", function(next) {
		keystone
			.list("PostCategory")
			.model.find()
			.sort("name")
			.exec(function(err, results) {
				if (err || !results.length) {
					return next(err);
				}

				locals.data.categories = results;

				next(err);
			});
	});

	// Load the current product
	view.on("init", function(next) {
		if (!locals.filters.keywords) {
			locals.data.invalid = "Invalid search";
			next();
		} else {
			locals.data.keywords = locals.filters.keywords;

			// search the full-text index
			var q = keystone.list("Post").paginate({
					page: req.query.page || 1,
					perPage: 10,
					maxPages: 10,
					filters: {
						title: new RegExp(locals.data.keywords, "i"),
						state: "published"
					}
				})
				.sort("-publishedDate")
				.populate("author categories");

			q.exec(function(err, results) {
				locals.data.posts = results;
				next(err);
			});
		}
	});

	view.render("search");
};
