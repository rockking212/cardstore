
var bcrypt = require('bcrypt')
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

var dbPort = 27017;
var dbHost = global.host;
var dbName = 'main-db';
var base_count = 1;
// use moment.js for pretty date-stamping //
var moment = require('moment');

var DM = {}; 
	DM.db = new Db(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}, {}));
	DM.db.open(function(e, d){
		if (e) {
			console.log(e);
		}	else{
			console.log('connected to database :: ' + dbName);
		}
	});
	DM.accounts = DM.db.collection('accounts');
	DM.bills = DM.db.collection('bills');
	DM.addresses = DM.db.collection('addresses');
	DM.images = DM.db.collection('images');
module.exports = DM;

// logging in //

DM.autoLogin = function(user, pass, callback)
{
	DM.accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

DM.manualLogin = function(user, pass, callback)
{
	DM.accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			bcrypt.compare(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}
// record insertion, update & deletion methods //

DM.create_addresses = function(newData, callback)
{
	DM.addresses.remove({user_id:newData.user_id});
	DM.addresses.findOne({addresses_id:newData.addresses_id}, function(e, o) {
		if (o){
			 callback('addresses-exist');
		}	else{
					// append date stBMp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						newData.statue = 0;
						DM.addresses.insert(newData, callback(null));
				};
	});
}

// record insertion, update & deletion methods //

DM.create_bills = function(newData, callback)
{
	// DM.bills.findOne({bill_id:newData.bill_id}, function(e, o) {
	// 	if (o){
	// 		callback('bill-exist');
	// 	}	else{
					// append date stBMp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						newData.statue = 0;
						DM.bills.insert(newData, callback(null));
	// 			};
	// });
}

// record insertion, update & deletion methods //

DM.create_images = function(newData, callback)
{
	DM.images.findOne({images_id:newData.images_id}, function(e, o) {
		if (o){
			callback('images-exist');
		}	else{
					// append date stBMp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						newData.statue = 0;
						DM.images.insert(newData, callback(null));
				};
	});
}

// record insertion, update & deletion methods //

DM.create_accounts = function(newData, callback)
{
		var date = new Date();
		var user_id ='' + date.getYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds()+base_count;
		base_count++;
		newData.user_id = user_id;
		console.log('new user:'+user_id); 
	DM.accounts.findOne({user:newData.user}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			DM.accounts.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					DM.saltAndHash(newData.pass, function(hash){
						newData.pass = hash;
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						DM.accounts.insert(newData, callback(null));
					});
				}
			});
		}
	});
}

DM.update = function(newData, callback)
{
	DM.accounts.findOne({user:newData.user}, function(e, o){
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			DM.accounts.save(o); callback(o);
		}	else{
			DM.saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				DM.accounts.save(o); callback(o);
			});
		}
	});
}

DM.updateAddress = function(newData, callback)
{
	DM.addresses.findOne({user_id:newData.user_id}, function(e, o){
		o.addresses_id  = newData.addresses_id;
		o.p_name      = newData.p_name;
		o.p_address   = newData.p_address;
		o.p_phone     = newData.p_phone;
		o.p_zip       = newData.p_zip;
		o.r_name      = newData.r_name;
		o.r_address   = newData.r_address;
		o.r_phone     = newData.r_phone;
		o.r_zip       = newData.r_zip;
		o.p_email     = newData.p_email;

	DM.addresses.save(o);
	});
}

DM.setPassword = function(email, newPass, callback)
{
	DM.accounts.findOne({email:email}, function(e, o){
		DM.saltAndHash(newPass, function(hash){
			o.pass = hash;
			DM.accounts.save(o); callback(o);
		});
	});
}

DM.validateLink = function(email, passHash, callback)
{
	DM.accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

DM.saltAndHash = function(pass, callback)
{
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(pass, salt, function(err, hash) {
			callback(hash);
		});
	});
}

DM.delete = function(id, callback)
{
	DM.accounts.remove({_id: this.getObjectId(id)}, callback);
}

// auxiliary methods //

DM.getEmail = function(email, callback)
{
	DM.accounts.findOne({email:email}, function(e, o){ callback(o); });
}

DM.getObjectId = function(id)
{
	return DM.accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}

DM.getAllAccountsRecords = function(callback)
{
	DM.accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

DM.getAllBillsRecords = function(callback)
{
	DM.bills.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};
DM.delAllRecords = function(id, callback)
{
	DM.accounts.remove(); // reset accounts collection for testing //
}

// just for testing - these are not actually being used //

DM.findById = function(id, callback)
{
	DM.accounts.findOne({_id: this.getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};


DM.findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	DM.accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}
