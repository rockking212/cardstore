
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var BM = require('./modules/bill-manager');
var EM = require('./modules/email-dispatcher');
var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable"),
    http = require("http"),
    url = require("url"),
    gm = require('gm');
module.exports = function(app) {

// main login page //

	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { locals: { title: 'Hello - Please Login To Your Account' }});
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/showaccount');
				}	else{
					res.render('login', { locals: { title: 'Hello - Please Login To Your Account' }});
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/home', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('home', {
				locals: {
					title : 'Control Panel',
					countries : CT,
					udata : req.session.user
				}
			});
	    }
	});

	// logged-in user homepage //
	
	app.get('/showaccount', function(req, res) {



	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
		BM.accounts.find({user:'test'}).toArray(function(error, results){
//					console.log(results);
//					console.log(results.length);
//					console.log(results[1].bill_id);

					res.render('showaccount', {
						locals: {
							title : '用户设置',
							countries : CT,
							udata : req.session.user,
							bill_list: results
								}
							});

		});
		}
	});
	app.post('/home', function(req, res){
		if (req.param('user') != undefined) {
			AM.update({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(o){
				if (o){
					req.session.user = o;
			// udpate the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}	else{
					res.send('error-updating-account', 400);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  locals: { title: 'Signup', countries : CT } });
	});
	
	app.post('/signup', function(req, res){
		AM.signup({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e, o){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.setPassword(email, nPass, function(o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { locals: { title : 'Account List', accts : accounts } });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.delete(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
/*	
	app.get('/reset', function(req, res) {
		AM.delAllRecords( );
		res.redirect('/print');
	});
*/
// show choose pic
	app.get('/item', function(req, res) {
		res.render('item', { title: '念恋卡 - ', username: '游客', name:'游客1', price:1 });
});
// complete_info page //
	
	app.post('/complete_info', function(req, res) {
//	    console.log(req.body);
		res.render('complete_info', { title: '念恋卡 - ', username:req.body.username, imagepath:req.body.imagepath, billid:req.body.billid});
	});

//submit bill

	app.post('/submit_bill', function(req, res) {
	    console.log(req.body);

		BM.create({
			bill_id : req.body.billid,
			imagepath 	: req.param('imagepath'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			phone	: req.param('phone'),
			country : req.param('country')
		}, function(e, o){
			if (e){
				res.send(e, 400);
			}	else{
res.render('final', { title: '念恋卡 - ', username:req.body.username, imagepath:req.body.imagepath, billid:req.body.billid});
			}
		});

	//	res.render('complete_info', { title: '念恋卡 - ', username:req.body.username, imagepath:req.body.imagepath, billid:req.body.billid});
	});
// show uploaded pic
	app.post('/upload', function(req, res) {
	    console.log(req.session.user.name);
//    console.log(req.body);
//    console.log(req.files);

	var date = new Date();
	var current_time = date.getYear() + '-' + date.getMonth() + '-' + date.getDate() + '-'+ date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

//    console.log(current_time);
//    console.log(req.files.upload.path);
//    get the temporary location of the file

	var tmp_path = req.files.upload.path;
//	req.session.user.name = 'test';
//    set where the file should actually exists - in this case it is in the "images" directory
	var target_path = './app/public/uploads/' +req.session.user.name+'-'+current_time+'-'+req.files.upload.name;
//    console.log(tmp_path);
//    console.log( target_path);
// move the file from the temporary location to the intended location
	fs.rename(tmp_path, target_path, function(err) {
    console.log( err);
		if (err) throw err;

// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
	fs.unlink(tmp_path, function() {
		if (err) throw err;        
	});

	res.render('upload', { title: '念恋卡 ', username: req.session.user.name, imagepath: 'uploads/'+req.session.user.name+'-'+current_time+'-'+req.files.upload.name });

});
        });
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

// show cuted pic
	app.post('/show', function(req, res) {
		var img_source = './app/public/'+req.body.cut_s;
		var cut_scale = req.body.cut_ow/500;
		var date = new Date();
		var current_time = '-'+date.getYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds();
		var target_save = 'cut/'+req.session.user.name + current_time+'.jpg';
//         console.log(current_time);   
//		console.log(req.body);
//		console.log(img_source);
		gm(img_source)
		.crop(req.body.cut_w*cut_scale, req.body.cut_h*cut_scale, req.body.cut_x*cut_scale, req.body.cut_y*cut_scale)
		.write('./app/public/'+target_save,function (err, stdout, stderr) {
       if(err) {
		res.write(stderr);
		throw err;
		}
		res.render('show', { title: '念恋卡 ', username: req.session.user.name, imagepath: target_save, billid: req.session.user.name + current_time });
	});
	});




};
// handler for displaying individual items


