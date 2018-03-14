var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';
	//locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;
	locals.data = {
		posts: []
	};

	view.on("init", function (next) {
		var q = keystone.list('Post').paginate({
			page: req.query.page || 1,
			perPage: 6,
			maxPages: 1,
			filters: {
				state: 'published',
			},
		}).sort('-publishedDate')
			.populate('author categories');

			q.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});
	});

	view.on('post', { action: 'contact' }, function (next) {

		var newEnquiry = new Enquiry.model();
		var updater = newEnquiry.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, subject, message',
			errorMessage: 'There was a problem submitting your enquiry:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.enquirySubmitted = true;
			}

			//return res.redirect("#contact");
			next();
		});
	});

	// Render the view
	view.render('index');
};
