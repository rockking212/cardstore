
var bcrypt = require('bcrypt')
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

var dbPort = 27017;
var dbHost = global.host;
var dbNBMe = 'bill';

// use moment.js for pretty date-stBMping //
var moment = require('moment');

var BM = {}; 
	BM.db = new Db(dbNBMe, new Server(dbHost, dbPort, {auto_reconnect: true}, {}), {w:1});
	BM.db.open(function(e, d){
		if (e) {
			console.log(e);
		}	else{
			console.log('connected to database :: ' + dbNBMe);
		}
	});
	BM.accounts = BM.db.collection('accounts');

module.exports = BM;

// logging in //

BM.manualLogin = function(user, pass, callback)
{
	BM.accounts.findOne({user:user}, function(e, o) {
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

BM.create = function(newData, callback)
{
	BM.accounts.findOne({bill_id:newData.bill_id}, function(e, o) {
		if (o){
			callback('bill-exist');
		}	else{
					// append date stBMp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						newData.statue = 0;
						BM.accounts.insert(newData, callback(null));
				};
	});
}

BM.update = function(newData, callback)
{
	BM.accounts.findOne({user:newData.user}, function(e, o){
		o.nBMe 		= newData.nBMe;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			BM.accounts.save(o); callback(o);
		}	else{
			BM.saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				BM.accounts.save(o); callback(o);
			});
		}
	});
}

BM.setPassword = function(email, newPass, callback)
{
	BM.accounts.findOne({email:email}, function(e, o){
		BM.saltAndHash(newPass, function(hash){
			o.pass = hash;
			BM.accounts.save(o); callback(o);
		});
	});
}

BM.validateLink = function(email, passHash, callback)
{
	BM.accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

BM.saltAndHash = function(pass, callback)
{
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(pass, salt, function(err, hash) {
			callback(hash);
		});
	});
}

BM.delete = function(id, callback)
{
	BM.accounts.remove({_id: this.getObjectId(id)}, callback);
}

// auxiliary methods //

BM.getEmail = function(email, callback)
{
	BM.accounts.findOne({email:email}, function(e, o){ callback(o); });
}

BM.getObjectId = function(id)
{
	return BM.accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}

BM.getAllRecords = function(callback)
{
	BM.accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

BM.delAllRecords = function(id, callback)
{
	BM.accounts.remove(); // reset accounts collection for testing //
}

// just for testing - these are not actually being used //

BM.findById = function(id, callback)
{
	BM.accounts.findOne({_id: this.getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};


BM.findByMultipleFields = function(a, callback)
{
// this takes an array of nBMe/val pairs to search against {fieldNBMe : 'value'} //
	BM.accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}
