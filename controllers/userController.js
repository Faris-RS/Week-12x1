const UserModel = require("../models/userModel");
const ProductModel = require("../models/productModel");
const BrandModel = require("../models/brandModel");
const TypeModel = require("../models/vehicletypeModel")
const FuelModel = require('../models/fueltypeModel')
const Wishlist = require('../models/wishlistModel')
const ShortCut = require('../models/shortcutModel')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
const OrderModel = require("../models/orderModel")
const BannerModel = require("../models/bannerModel");
// const { default: mongoose } = require("mongoose");
const Razorpay = require('razorpay')
const mongoose = require('mongoose');
const { nextTick } = require("process");






//********************************************* START OTP **************************************************//
// Email OTP Verification

var FullName;
var UserName;
var Email;
var Phone;
var Password;

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: 'Gmail',

  auth: {
    user: 'testfaristest@gmail.com',
    pass: 'xgzxaxiolxxvcfsc',
  }

});



var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);


//********************************************* END OTP **************************************************//


module.exports = {

  // DEMO
  // demo: (req, res) => {
  //   try {
  //     res.render('user/profile', { login: true, user: req.session.user })

  //   } catch (err) {
  //     next(err)
  //   }
  // },




  // User home page
  home: async (req, res) => {
    try {
      if (req.session.userLogin) {
        const banner = await BannerModel.find()
        const products = await ProductModel.find({ sold: 'Notsold' }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType').sort({ date: -1 }).limit(6)
        const brand = await BrandModel.find()
        const fuel = await FuelModel.find()
        const type = await TypeModel.find()
        res.render("user/home", { login: true, user: req.session.user, banner, products, brand, fuel, type });
      } else {
        const banner = await BannerModel.find()
        const products = await ProductModel.find({ sold: 'Notsold' }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType').sort({ date: -1 }).limit(6)
        const brand = await BrandModel.find()
        const fuel = await FuelModel.find()
        const type = await TypeModel.find()
        res.render('user/home', { login: false, banner, products, brand, fuel, type });
      }

    } catch (err) {
      next(err)
    }
    // res.send("You just created a User ...!!!");
  },

  // User signin page
  signin: (req, res) => {
    try {
      let NoUser;
      let PwMatch
      if (!req.session.userLogin) {
        
        res.render('user/signin',{NoUser,PwMatch});
      } else {
        res.redirect('/')
      }

    } catch (err) {
      next(err)
    }
  },


  //**********************************SIGNUP USER *******************************************/

  // OTP
  otp: async (req, res) => {
   
      FullName = req.body.fullName
      UserName = req.body.userName
      Email = req.body.email;
      Phone = req.body.phone
      Password = req.body.password

      const user = await UserModel.findOne({ email: Email });
     
      if (!user) {
        // send mail with defined transport object
        var mailOptions = {
          to: req.body.email,
          subject: "Otp for registration is: ",
          html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('OTP Sent', info.messageId);

          res.render('user/otp');
        });

      }
      else {
        userExist=true
        // console.log('user already exits');
        res.render('user/signup',{userExist})
      }

    // } catch (err) {
    //   next(err)
    // }


  },


  resendotp: (req, res) => {
    try {
      var mailOptions = {
        to: Email,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('OTP Resent', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('user/otp', { msg: "otp has been sent" });
      });

    } catch (err) {
      next(err)
    }
  },


  verifyotp: (req, res) => {
    try {
      if (req.body.otp == otp) {
        // res.send("You has been successfully registered");

        const newUser = UserModel(
          {
            fullName: FullName,
            userName: UserName,
            email: Email,
            phone: Phone,
            password: Password,
          }
        );
        console.log(req.body);
        let otpError = false;
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;

            newUser
              .save()
              .then(() => {
                res.redirect("/signin");
              })
              .catch((err) => {
                console.log(err);
                res.redirect("/signin")
              })
          })
        })

      }
      else {
        res.render('user/otp', { msg: 'otp is incorrect' });
      }

    } catch (err) {
      next(err)
    }
  },


  //***************************************** END SIGNUP USER ****************************************/


  //signin
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ $and: [{ email: email }, { status: "Unblocked" }] });
      let NoUser=false;
      let PwMatch=false;
      if (!user) {
        NoUser=true
        // console.log('no such user');
        return res.render('user/signin', {NoUser,PwMatch});
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        PwMatch=true
        // console.log('Password Incorrect');
        return res.render('user/signin',{NoUser, PwMatch});
      }
      req.session.user = user.userName
      req.session.userId = user._id
      req.session.userLogin = true;
      res.redirect('/');

    } catch (err) {
      next(err)
    }
  },

  signup: async (req, res) => {
    let userExist=false
    res.render('user/signup',{userExist})
  },

  //forgot password start
  forgotpassword: (req, res) => {
    // console.log('got forgot password');
    res.render('user/forgotpassword');
  },

  resetpassword: async (req, res) => {
    // console.log('entered resetpassword');
    const userEmail = req.body;
    req.session.email = userEmail;
    // console.log(userEmail);
    // console.log('got user email');
    const user = await UserModel.findOne({ $and: [{ email: userEmail.email }, { status: "Unblocked" }] });
    // console.log('found user');
    if (!user) {
      return res.redirect('/signin');
    } else {
      // mail content
      var mailOptions = {
        to: req.body.email,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
      };
      // console.log('OTP Sent for Forgot Password');
      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('OTP Sent for Forgot password', info.messageId);
        // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // console.log('mail send');
        res.render('user/passwordotp');
        // console.log('got otp page');
      });
    }
  },

  verifypasswordotp: (req, res) => {
    // console.log('setting new password');
    if (req.body.otp == otp) {
      // console.log('correct otp');
      res.render('user/newpassword');
    } else {
      // console.log('incorrect otp');
      res.render('user/passwordotp');
    }
    // res.render('user/newpassword');
  },

  settingpassword: async (req, res) => {
    Pass1 = req.body.password1;
    Pass2 = req.body.password2;
    // console.log(Pass1);
    // console.log(Pass2);
    if (Pass1 === Pass2) {

      pass = await bcrypt.hash(Pass2, 10)
      // console.log('password :' + pass);

      // console.log('checked password');
      // console.log(req.session.email);
      existUser = req.session.email;
      const updateUser = await UserModel.updateOne({ email: existUser.email }, { $set: { password: pass } });
      console.log(updateUser);
      res.redirect('/signin');

    } else {
      // console.log('incorrect pass');
      res.render('user/newpassword');
    }
    // console.log('redirect to signin page');

  },
  //forgot password end

  // All Product
  allproductpage: async (req, res) => {
    try {
      if (req.session.userLogin) {
        id = req.params.id

        const products = await ProductModel.find({ sold: 'Notsold' }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType').sort({ date: -1 })
        // console.log(products)
        const brand = await BrandModel.find()
        const fuel = await FuelModel.find()
        const type = await TypeModel.find()
        const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

        res.render('user/allProducts', { login: true, user: req.session.user, products, brandproducts, brand, fuel, type })
      }
      else {
        id = req.params.id

        const products = await ProductModel.find({ sold: 'Notsold' }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType').sort({ date: -1 })
        // console.log(products)
        const brand = await BrandModel.find()
        const fuel = await FuelModel.find()
        const type = await TypeModel.find()
        const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

        res.render('user/allProducts', { login: false, products, brandproducts, brand, fuel, type })

      }

    } catch (err) {
      next(err)
    }

  },


  // Category product page
  categoryproductpage: async (req, res) => {
    if (req.session.userLogin) {

      id = req.params.id
      // const name = await ProductModel.findById({_id: id}).populate('brand')
      const name = req.params.category
      console.log(name);
      const brand = await BrandModel.find()
      const fuel = await FuelModel.find()
      const type = await TypeModel.find()
      const brandproducts = await ProductModel.find({ sold: 'Notsold', $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType').sort({ date: -1 })
      // console.log(brandproducts);
      res.render('user/categoryProducts', { login: true, name, user: req.session.user, name, brandproducts, brand, type, fuel })
    }
    else {
      id = req.params.id
      const name = req.params.category
      console.log(name);
      const brand = await BrandModel.find()
      const fuel = await FuelModel.find()
      const type = await TypeModel.find()
      const brandproducts = await ProductModel.find({ sold: 'Notsold', $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType').sort({ date: -1 })
      // console.log(brandproducts);
      res.render('user/categoryProducts', { login: false, name, brandproducts, brand, type, fuel })

    }
  },


  // Single Product
  singleProductpage: async (req, res) => {
    try {
      if (req.session.userLogin) {

        const product = await ProductModel.findById({ _id: req.params.id }).populate('type').populate('brand').populate('fuelType')
        // console.log(product);
        id = req.params.id
        
        const newID = id
        const brand = await BrandModel.find()
        const fuel = await FuelModel.find()
        const type = await TypeModel.find()
        const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

        res.render('user/singleProduct', { login: true, user: req.session.user, product, brandproducts, brand, type, fuel })
      } else {
        const product = await ProductModel.findById({ _id: req.params.id }).populate('type').populate('brand').populate('fuelType')
        // console.log(product);
        id = req.params.id
        // console.log(id);
        const brand = await BrandModel.find()
        const fuel = await FuelModel.find()
        const type = await TypeModel.find()
        const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

        res.render('user/singleProduct', { login: false, user: req.session.user, product, brandproducts, brand, type, fuel })

      }

    } catch (err) {
      next(err)
    }
  },


  // Add to Wishlist
  addtowishlist: async (req, res) => {
    try {
      if (req.session.userLogin) {

        let productId = req.params.productId
        let userId = req.session.userId   //user id
        let wishlist = await Wishlist.findOne({ userId })

        if (wishlist) {
          await Wishlist.findOneAndUpdate({ userId: userId }, { $addToSet: { productIds: productId } })
          res.redirect('/allproductpage')
        }
        else {
          const newwishlist = new Wishlist({ userId, productIds: [productId] })
          newwishlist.save()
            .then(() => {
              res.redirect('/allproductpage')
            })
        }

      }
      else {
        res.redirect('/signin')
      }

    } catch (err) {
      next(err)
    }

  },


  // Wishlist Page
  wishlist: async (req, res) => {
    try {
      id = req.params.id
      let userId = req.session.userId;
      // console.log(userId)
      // let list = await Wishlist.findOne({ userId: userId }).populate('productIds').populate('productIds.$.brand')
      let list = await Wishlist.aggregate([
        {
          '$match': {
            userId: mongoose.Types.ObjectId(userId)
          }
        },
        {
          '$unwind': {
            'path': '$productIds'
          }
        }, {
          '$lookup': {
            'from': 'productdatas',
            'localField': 'productIds',
            'foreignField': '_id',
            'as': 'result'
          }
        }, {
          '$unwind': {
            'path': '$result'
          }
        }, {
          '$lookup': {
            'from': 'branddatas',
            'localField': 'result.brand',
            'foreignField': '_id',
            'as': 'result.brand'
          }
        }, {
          '$unwind': {
            'path': '$result.brand'
          }
        }, {
          '$lookup': {
            'from': 'vehicledatas',
            'localField': 'result.type',
            'foreignField': '_id',
            'as': 'result.type'
          }
        }, {
          '$unwind': {
            'path': '$result.type'
          }
        }, {
          '$lookup': {
            'from': 'fueldatas',
            'localField': 'result.fuelType',
            'foreignField': '_id',
            'as': 'result.fuelType'
          }
        }, {
          '$unwind': {
            'path': '$result.fuelType'
          }
        }, {
          '$project': {
            'result': 1
          }
        }
      ])
      // console.log(list)
      if (list) {
        // let wish = list.productIds
        if (req.session.userLogin) {
          const brand = await BrandModel.find()
          const fuel = await FuelModel.find()
          const type = await TypeModel.find()
          const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

          res.render("user/wishlist", { login: true, user: req.session.user, list, brandproducts, index: 1, brand, fuel, type })
        } else {
          res.redirect('/signin')
        }
      }

    } catch (err) {
      next(err)
    }

  },


  removeFromWishlist: async (req, res) => {
    try {
      if (req.session.userLogin) {

        let productId = req.params.id
        let userId = req.session.userId;
        await Wishlist.findOneAndUpdate({ userId }, { $pull: { productIds: productId } })
          .then(() => {
            res.redirect('/wishlist')
          })
      } else {
        res.redirect('/signin')
      }

    } catch (err) {
      next(err)
    }

  },


  // Car Blocking Page
  carblockingpage: async (req, res) => {
    try {

      if (req.session.userLogin) {

        const id = req.params.id;
        const product = await ProductModel.findOne({ _id: id })
        const brand = await BrandModel.find()
        const fuel = await FuelModel.find()
        const type = await TypeModel.find()
        const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')
        const fullAmount = product.price
        const advance = product.advance

        res.render('user/carblockingpage', { login: true, user: req.session.user, brandproducts, brand, type, fuel, product, id, fullAmount, advance })
      }
      else {
        res.redirect('/signin')
      }
    } catch (err) {
      next(err)
    }

  },


  coupencheck: async (req, res) => {
    // console.log('reached coupon');
    const id = req.body.product
    const product = await ProductModel.findOne({ _id: id })
    // console.log(product);
    const userCoupon = req.body.coupen
    // console.log('got product and coupen');
    const productPrice = product.price
    const advancePrice = product.advance
    const fullAmount = req.body.fullAmount
    const advance = req.body.advance
    const dbCoupon = await coupenModel.findOne({ coupenName: userCoupon })
    const couponId = dbCoupon._id
    const couponID = couponId.valueOf()
    // console.log(couponID);
    // console.log(dbCoupon, 'dbcoupon');
    if (dbCoupon) {
      const discountPercent = dbCoupon.discount
      let newAmount = (productPrice * discountPercent) / 100
      let discountMax = dbCoupon.maximum

      if (newAmount >= discountMax) {
        newAmount = discountMax
      }

      const newPrice = productPrice - newAmount - advancePrice
      // console.log(newAmount, discountMax, newPrice);
      // console.log('yes coupon');
      const Test = new ShortCut(
        {
          name: newPrice,
        }
      );
      Test
        .save()
        .then(()=>{      
          res.render('user/couponedbookpage', { login: true, user: req.session.user, newPrice, advancePrice, id, product })
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/")
        })
    }
    else {
      const brand = await BrandModel.find()
      const fuel = await FuelModel.find()
      const type = await TypeModel.find()
      const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')
      // console.log('no coupon');
      res.render('user/carblockingpage', { login: true, user: req.session.user, brandproducts, brand, type, fuel, product, id, fullAmount, advance })


    }
    // console.log('asdasdas');


  },

  // Block Car 
  blockCar: async (req, res) => {

    if (req.session.userLogin) {

      const id = req.params.id
      await UserModel.findOneAndUpdate({ _id: req.session.userId }, { $addToSet: { BookedVehicles: id } })
      await ProductModel.findByIdAndUpdate({ _id: id }, { $set: { status: "Blocked" } })
        .then(() => {
          res.redirect('/allproductpage')
        })
    } else {
      res.redirect('/signin')

    }
  },


  ordersuccesshome: async (req,res)=>{
    const id=req.session.userId
    const User = await UserModel.find({_id:id}).populate('email','email')
    const UserNoArray = User[0]
    const email = UserNoArray.email
    // console.log(User);
    console.log(email);
    // console.log(email,'0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');


      const arrLength = UserNoArray.BookedVehicles.length;
     
      const Id = UserNoArray.BookedVehicles[arrLength-1];
      const productID = Id.valueOf()
      // console.log(productID);
      const productDetails = await ProductModel.find({_id:productID})
      console.log(productDetails);
      // console.log(Id.valueOf());
      // const idtest=Id.id
      // // console.log(Id._id);
      // console.log(idtest);
      
    const product = await ShortCut.find().sort({_id:-1}).limit(1)
    // console.log(product);
    const shortcutID = product[0]
    const productPrice = shortcutID.name
    const balanceAmount = productPrice[0];


    var mailOptions = {
      to: email,    //email
      subject: "Order Success",
      html: "<h3>Your payment of ID is succesfull and details are furnished below.</h3> <br><br>Car Name:"+ productDetails.productName +"<hr>Price: "+ balanceAmount +"<hr>Advance amount: "+ productDetails.advance +"<br><br>Please make sure to pay the remaining amount or to finance it within a week as we will only keep a car on hold for 7 days. No extra negotitaions are applicable."

    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      // console.log('Order succcess mail sent', info.messageId);
      // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });
    res.redirect('/')
  },

  // Order Payment
  order: async (req, res) => {
    try {
      if (req.session.userLogin) {
        const id = req.body.proId
        // console.log(id);
        const amount = await ProductModel.findOne({ _id: id })

        var instance = new Razorpay({
          key_id: 'rzp_test_WMLYqfRmARx3mG',
          key_secret: 'BlR899sYazh9UinmUx2UeDb5',
        });

        instance.orders.create(
          {
            amount: (amount.advance) * 100,
            currency: "INR",
            receipt: "car1",
          },
          function (err, order) {
            if (err) {
              // console.log('Error');
              console.log(err);
            } else {
              console.log("New Order: ", order);
              let response = {
                id, order
              }
              res.status(200).send(response);

            }
          }

        );
      }

    } catch (err) {
      next(err)
    }

  },


  // Verify Payment
  verifyorder: async (req, res) => {
    try {
      const details = req.body
      // console.log(req.body, "dt");
      const crypto = require('crypto')
      let hmac = crypto.createHmac('sha256', "BlR899sYazh9UinmUx2UeDb5")
      hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex')

      const orderId = details['order[order][receipt]']
      // console.log("Showing orderID");
      // console.log(orderId);
      // console.log("gjhgjg", hmac);
      // console.log(details['payment[razorpay_signature]'])
      let response = {}
      if (details['payment[razorpay_signature]'] == hmac) {
        console.log('order Successfull');
        // response = { status: true }
        response.status = true;
      } else {
        // response = { status: false }
        response.status = false;
        console.log('payment failed');
      }
      res.send(response);
      // res.json({
      //   status:true
      // })
    } catch (err) {
      next(err)
    }
  },


  // Block Car after payment
  ordersuccess: async (req, res) => {
    try {
      if (req.session.userLogin) {
        const userId = req.session.userId
        const id = req.params.id

        const blocked = OrderModel({
          userId: userId,
          product: id
        })

        // console.log(Date.now());
        await UserModel.findOneAndUpdate({ _id: userId }, { $addToSet: { BookedVehicles: id } })
        await ProductModel.findByIdAndUpdate({ _id: id }, { $set: { status: "Blocked", blockedDate: Date.now() } })

        await blocked.save()
          .then(() => 
          { res.render('user/ordersuccess')
          }).catch((err) => {
            console.log(err.message);
            res.render("user/orderfailed");
          });

      }

    } catch (err) {
      next(err)
    }

  },


  // BlockedCarModel: async (req,res) => {
  //   console.log("reached here");
  //   const userId = req.session.userId;
  //   const productId = req.params.id;
  //   const blockedcar = BlockedCarModel({userId , productId})
  //   await blockedcar.save()
  //   .then(()=>{
  //     console.log("reached next>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  //     res.redirect('/allproductpage');
  //   })
  //   .catch((err)=>{
  //     console.log(err);
  //   })
  // } ,


  blockedcarspage: async (req, res) => {
    try {
      if (req.session.userLogin) {

        const id = req.params.id
        const userId = req.session.userId
        const cars = await UserModel.aggregate([
          {
            '$match': {
              _id: mongoose.Types.ObjectId(userId)
            }
          },
          {
            '$unwind': {
              'path': '$BookedVehicles'
            }
          }, {
            '$lookup': {
              'from': 'productdatas',
              'localField': 'BookedVehicles',
              'foreignField': '_id',
              'as': 'result'
            }
          }, {
            '$unwind': {
              'path': '$result'
            }
          }, {
            '$lookup': {
              'from': 'branddatas',
              'localField': 'result.brand',
              'foreignField': '_id',
              'as': 'result.brand'
            }
          }, {
            '$unwind': {
              'path': '$result.brand'
            }
          }, {
            '$lookup': {
              'from': 'vehicledatas',
              'localField': 'result.type',
              'foreignField': '_id',
              'as': 'result.type'
            }
          }, {
            '$unwind': {
              'path': '$result.type'
            }
          }, {
            '$lookup': {
              'from': 'fueldatas',
              'localField': 'result.fuelType',
              'foreignField': '_id',
              'as': 'result.fuelType'
            }
          }, {
            '$unwind': {
              'path': '$result.fuelType'
            }
          }, {
            '$project': {
              'result': 1
            }
          }
        ])
        // console.log(cars, '1234567');

        if (cars) {
          // let wish = list.productIds
          const brand = await BrandModel.find()
          const fuel = await FuelModel.find()
          const type = await TypeModel.find()
          const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

          res.render('user/blockedcars', { login: true, user: req.session.user, brandproducts, cars, brand, fuel, type, index: 1 })
        } else {
          res.redirect('/signin')
        }
      }

    } catch (err) {
      next(err)
    }


  },





  profile: async (req, res) => {
    try {
      if (req.session.userLogin) {
        const id = req.session.userId;
        const userdetails = await UserModel.findById({ _id: id })
        const brand = await BrandModel.find()
        const fuel = await FuelModel.find()
        const type = await TypeModel.find()
        const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

        res.render('user/profile', { login: true, user: req.session.user, userdetails, brandproducts, brand, fuel, type })
      } else {
        res.redirect('/signin')

      }

    } catch (err) {
      next(err)
    }
  },

  editprofilepage: async (req, res) => {
    try {
      if (req.session.userLogin) {
        const id = req.params.id
        let profile = await UserModel.findById({ _id: id })
        const brand = await BrandModel.find()
        const fuel = await FuelModel.find()
        const type = await TypeModel.find()
        const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

        res.render('user/editprofile', { login: true, user: req.session.user, brandproducts, profile, brand, fuel, type })
      } else {
        res.redirect('/signin')

      }

    } catch (err) {
      next(err)
    }
  },

  updateProfile: async (req, res) => {
    try {
      if (req.session.userLogin) {
        const { fullName, userName, email, phone } = req.body;

        let details = await UserModel.findOneAndUpdate({ _id: req.params.id }, { $set: { fullName, userName, email, phone } });
        await details.save()
          .then(() => {
            res.redirect('/profile')
          })
      }
      else {
        res.redirect('/signin')
      }

    } catch (err) {
      next(err)
    }
  },


  search:async (req,res)=>{
    const searchQuery = req.body.search
    console.log(searchQuery);
    // const searchString = ''+searchQuery
    // console.log(searchString);
    const search = await ProductModel.find({productName:{ $regex: searchQuery, '$options' : 'i' }})
  

    console.log(search);



    if(search.length!=0){
    const searchNoArray = search[0]
    const searchedProduct = searchNoArray._id
    const searchedID = searchedProduct.valueOf()
    console.log(searchedID);
    
    if (req.session.userLogin) {

      const product = await ProductModel.findById({ _id: searchedID }).populate('type').populate('brand').populate('fuelType')
      // console.log(product);
      id = searchedID
      const brand = await BrandModel.find()
      const fuel = await FuelModel.find()
      const type = await TypeModel.find()
      const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

      res.render('user/singleProduct', { login: true, user: req.session.user, product, brandproducts, brand, type, fuel })
    } else {

      const product = await ProductModel.findById({ _id: searchedID }).populate('type').populate('brand').populate('fuelType')
      // console.log(product);
      id = searchedID
      const brand = await BrandModel.find()
      const fuel = await FuelModel.find()
      const type = await TypeModel.find()
      const brandproducts = await ProductModel.find({ $or: [{ type: id }, { brand: id }, { fuelType: id }] }).populate('type', 'typeName').populate('brand', 'brand').populate('fuelType')

      res.render('user/singleProduct', { login: false, user: req.session.user, product, brandproducts, brand, type, fuel })

    }
  }

  else{
    res.redirect('/')
  }

    // console.log(search);
    // res.redirect('/')


  },













  //signup
  // signup: async (req, res) => {

  //   const newUser = UserModel(req.body
  //     //   {
  //     //   fullName: req.body.fullName,
  //     //   userName: req.body.userName,
  //     //   email: req.body.email,
  //     //   phone: req.body.phone,
  //     //   password: req.body.password
  //     // }
  //   );
  //   console.log(req.body);

  //   bcrypt.genSalt(10, (err, salt) => {
  //     bcrypt.hash(newUser.password, salt, (err, hash) => {
  //       if (err) throw err;
  //       newUser.password = hash;

  //       newUser
  //         .save()
  //         .then(() => {
  //           res.redirect("/signin");
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           res.redirect("/signin")
  //         })
  //     })
  //   })
  // },





  //-------------------------------------------------------------------------
  // LOG OUT


  


  logout: (req, res) => {
    try {
      req.session.loggedOut = true;
      req.session.destroy()
      res.redirect('/')
    } catch (err) {
      next(err)
    }
  },
}