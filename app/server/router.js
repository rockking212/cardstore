
var CT = require('./modules/country-list');
var DM = require('./modules/db-manager');
var EM = require('./modules/email-dispatcher');
var util = require('..//public/js/util.js'), 
constant = require('../public/js/constant.js'); 
var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable"),
    http = require("http"),
    url = require("url"),
    gm = require('gm');
var base_count = 0;
function main_show_bills(user_id, bills_id,res)
{
					console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
					console.log(user_id);
					console.log(bills_id);

		DM.images.find({user_id:user_id}).toArray(function(error, image_list){
					// console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
					// console.log(results);
					// console.log(results.length);
				//	console.log(results[1].bill_id);
		DM.addresses.find({user_id:user_id}).toArray(function(error, addresses){
					DM.bills.find({bills_id:bills_id}).toArray(function(error, bills){
					// console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
					console.log(bills);
					console.log("bills");
					res.render('show_bills', {
						locals: {
							title : '用户设置',
							countries : CT,
							udata : "user",
							img_list: image_list,
							addresses: addresses[0],
							bills: bills
								}
							});
				});

		});
				});
}
module.exports = function(app) {

// main login page //

	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { locals: { title: '念恋卡-留住所有怀念的地方' }});
		}	else{
	// attempt automatic login //
			DM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/show_images');
				}	else{
					res.render('login', { locals: { title: '念恋卡-留住所有怀念的地方' }});
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		DM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
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
		DM.accounts.find({user:'test'}).toArray(function(error, results){
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
			DM.update({
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
		DM.create_accounts({
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
		DM.getEmail(req.param('email'), function(o){
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
		DM.validateLink(email, passH, function(e){
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
		DM.setPassword(email, nPass, function(o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/accounts_print', function(req, res) {
		DM.getAllAccountsRecords( function(e, accounts){
			res.render('print', { locals: { title : 'Account List', accts : accounts } });
		})
	});
	app.get('/bills_print', function(req, res) {
		DM.getAllBillsRecords( function(e, bills){
			res.render('print', { locals: { title : 'bills List', accts : bills } });
		})
	});	
	app.post('/delete', function(req, res){
		DM.delete(req.body.id, function(e, obj){
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
	app.get('/DM_reset', function(req, res) {
		DM.delAllRecords( );
		res.redirect('/print');
	});
// show choose pic
	app.get('/item', function(req, res) {
		res.render('item', { title: '念恋卡 - ', username: '游客', name:'游客1', price:1 });
});
// complete_info page //
	
	app.post('/complete_info', function(req, res) {
//	    console.log(req.body);
		res.render('complete_info', { title: '念恋卡 - ', username:req.body.username, imagepath:req.body.imagepath, billid:req.body.billid});
	});
	app.get('/add_address', function(req, res) {
//	    console.log(req.body);
		res.render('add_address', { title: '念恋卡 - ', username:req.body.username, imagepath:req.body.imagepath, billid:req.body.billid});
	});
//submit bill

	app.post('/added_list', function(req, res) {
	    console.log(req.body);

		DM.create_bills({
			bill_id : req.body.billid,
			imagepath 	: req.param('imagepath'),
			email 	: req.param('email'),
			user 	: 'test',
			phone	: req.param('phone'),
			country : req.param('country'),
			count   : 1
		}, function(e, o){
			if (e){
				res.send(e, 400);
			}	else{

	        res.redirect('/show_list');
			}
		});
	});
//add a image
	app.post('/add_images', function(req, res) {
	    console.log(req.body);

		DM.create_images({
			images_id   : req.body.billid,
			imagepath 	: req.param('imagepath'),
			user_id 	: req.session.user.user_id,
			count       : 0,
			text        :req.body.text
		}, function(e, o){
			if (e){
				res.send(e, 400);
			}	else{

	        res.redirect('/show_images');
			}
		});
	});

	app.post('/add_addresses', function(req, res) {
	    console.log(req.body);
	var date = new Date();
	var current_time = '' + date.getYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds();
		// 	DM.updateAddress({
		// 	addresses_id: current_time,
		// 	user_id 	: req.session.user.user_id,
		// 	p_name      : req.body.p_name,
		// 	p_address   : req.body.p_address,
		// 	p_phone     : req.body.p_phone,
		// 	p_zip       : req.body.p_zip,
		// 	r_name      : req.body.r_name,
		// 	r_address   : req.body.r_address,
		// 	r_phone     : req.body.r_phone,
		// 	r_zip       : req.body.r_zip,
		// 	p_email     : req.body.p_email
		// });
		DM.create_addresses({
			addresses_id: current_time,
			user_id 	: req.session.user.user_id,
			p_name      : req.body.p_name,
			p_address   : req.body.p_address,
			p_phone     : req.body.p_phone,
			p_zip       : req.body.p_zip,
			r_name      : req.body.r_name,
			r_address   : req.body.r_address,
			r_phone     : req.body.r_phone,
			r_zip       : req.body.r_zip,
			p_email     : req.body.p_email

		}, function(e, o){
			if (e){
				res.send(e, 400);
			}	else{

	        res.redirect('/show_images');
			}
		});

	//	res.render('complete_info', { title: '念恋卡 - ', username:req.body.username, imagepath:req.body.imagepath, billid:req.body.billid});
	});

	app.get('/show_images', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
		DM.images.find({user_id:req.session.user.user_id}).toArray(function(error, image_list){
					// console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
					// console.log(results);
					// console.log(results.length);
				//	console.log(results[1].bill_id);
		DM.addresses.find({user_id:req.session.user.user_id}).toArray(function(error, addresses){
					// console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
					// console.log(addresses);
					// console.log(addresses.length);
					var addresses_a = true;
					if(addresses.length == 0)addresses_a = false;
				//	console.log(results[1].bill_id);
					res.render('show_images', {
						locals: {
							title : '用户设置',
							countries : CT,
							udata : req.session.user,
							img_list: image_list,
							addresses: addresses[0],
							addresses_a: addresses_a
								}
							});

		});
				});
		}
	});

	app.get('/show_bills', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
		// DM.images.find({user_id:req.session.user.user_id}).toArray(function(error, image_list){
		// 			// console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
		// 			// console.log(results);
		// 			// console.log(results.length);
		// 		//	console.log(results[1].bill_id);
		// DM.addresses.find({user_id:req.session.user.user_id}).toArray(function(error, addresses){
		// 			DM.bills.find({bills_id:req.body.bills_id}).toArray(function(error, bills){
		// 			// console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
		// 			console.log(bills);
		// 		//	console.log(results[1].bill_id);
		// 			res.render('show_bills', {
		// 				locals: {
		// 					title : '用户设置',
		// 					countries : CT,
		// 					udata : req.session.user,
		// 					img_list: image_list,
		// 					addresses: addresses[0],
		// 					addresses_a: addresses_a
		// 						}
		// 					});
		// 		});

		// });
		// 		});
			main_show_bills(req.session.user.user_id,req.session.user.user,res);
		}
	});

//add a image
	app.post('/add_bills', function(req, res) {
			    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{

	//	console.log(req.body);
	var date = new Date();
	var bill_id = req.session.user.user + date.getYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds();
		for (var i=0;i<9;i++)//最多添加9个
	{

		var count_n = "req.session.req.body.count" + i;
		var image_n = "req.session.req.body.image_" + i;
		var count = eval(count_n);
		var image = eval(image_n);
		// console.log('数量：'+count);
		if(count>0)
					// console.log('数量：'+count);
			{
				DM.create_bills({
					user_id			: req.session.user.user_id,
					bill_id			: bill_id,
					optionsRadios	: req.session.req.body.optionsRadios,
					count			: count,
					images_id		: image
				}, function(e, o){
					if (e){
						res.send(e, 400);
					}	else{
						// console.log("to _db:"+count);
						// console.log("to _db:"+images_id);
			        // res.redirect('/show_images');
					}
				});
			}
		}
					main_show_bills(req.session.user.user_id,bill_id,res);
					// res.redirect('/show_bills');
				}

	});
	app.post('/submit_item', function(req, res) {
	    console.log(req.body);

		DM.create_bills({
			user_id : req.session.user.user_id,
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
	console.log("test user comes!");
//    console.log(req.body);
    console.log(req.files);

//    check_file_type

if(!util.is_filetype(req.files.upload.name, constant.RESUME_FILETYPES)) { 
// 由于客户端已做判断，所以这样的情况都是恶意上传的，直接提示 
//res.send('文件格式错误: ' + req.files.upload.name + ' , 请上传' + constant.RESUME_FILETYPES + '格式的文件'); 
res.send('文件格式错误: ' + req.files.upload.name + '煮豆持作羹，漉豉以为汁，萁在釜下燃，豆在釜中泣。本是同根生，相煎何太急。'); 
return; 
} 

	var username;
	    if (req.session.user == null){
		username = 'test_user';
		}else
			{
		username = req.session.user.name;
			}
//	console.log(username);
	var date = new Date();
	var current_time = date.getYear() + '-' + date.getMonth() + '-' + date.getDate() + '-'+ date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

//    console.log(current_time);
//    console.log(req.files.upload.path);
//    get the temporary location of the file

	var tmp_path = req.files.upload.path;
//    set where the file should actually exists - in this case it is in the "images" directory
	var target_path = './app/public/uploads/' +username+'-'+current_time+'-'+req.files.upload.name;
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

	res.render('upload', { title: '念恋卡 ', username: username, imagepath: 'uploads/'+username+'-'+current_time+'-'+req.files.upload.name });

});
        });
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

// show cuted pic
	app.post('/show', function(req, res) {
	var username;
	var date = new Date();
	var current_time = '' + date.getYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds();
	    if (req.session.user == null){
			username = '' + current_time + base_count;
			tmp_count++;
			console.log('a new tmp user:' + tmp_count); 
			console.log('tmp user name:' + username); 
		}else
			{
username = req.session.user.user;
			}
//	console.log(username);

		var img_source = './app/public/'+req.body.cut_s;
		var cut_scale = req.body.cut_ow/500;
		var target_save = 'cut/'+ username + current_time+'.jpg';  
//		console.log(req.body);
//		console.log(img_source);
		gm(img_source)
		.crop(req.body.cut_w*cut_scale, req.body.cut_h*cut_scale, req.body.cut_x*cut_scale, req.body.cut_y*cut_scale)
		.write('./app/public/'+target_save,function (err, stdout, stderr) {
       if(err) {
		res.write(stderr);
		throw err;
		}
		res.render('show', { title: '念恋卡 ', username: username, imagepath: target_save, billid: username + current_time });
	});
	});




};
// handler for displaying individual items


