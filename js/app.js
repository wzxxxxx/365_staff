
(function($, owner) {
	$.init({
		style: {
			'scrollIndicator': 'none'
		}
	})

	document.write("<script language=javascript src='js/md5.js'></script>");

	var serverUrl = "http://365gateway.lanyukj.cn/public/index.php";

	Date.prototype.format = function(fmt) {
		var o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			"S": this.getMilliseconds() //毫秒 
		};
		if(/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for(var k in o) {
			if(new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
	}

	//url拼接(包含sign)
	makeurl = function(data, isGetToken, isUploadImg) {
		if(!isGetToken) {
			data.gateway = "App.Site.gatewayapp";
			//			data.Proj_ID = 2;
			//			data.Proj_Key = 'MzY15pm65oWn5a625pS/MTUzMzI2NjM0OA==';
			//			data.Proj_Secret ='NTdhZjg3YTg1ZThmYTYwMWRlOTc2YmQwNjcyNTMxNDMxNTMzMjY2MzQ4';
			//			data.g_mark = uuid;
			if(localStorage.getItem('token')) {
				data.g_token = JSON.parse(localStorage.getItem('token')).data.info.g_token;
				data.g_mark = JSON.parse(localStorage.getItem('token')).data.info.g_mark;
			}
		}
		var str = '',
			arr = [],
			str2 = '';
		Object.keys(data).forEach(function(key) {
			str += ("&" + key + "=" + data[key]);
			arr.push(key);
		});
		arr.sort();
		for(var i in arr) {
			str2 += data[arr[i]];
		}
		str += "&sign=" + hex_md5(str2);
		var signValue = hex_md5(str2);
		if(isUploadImg) {
			data.sign = signValue;
			return data;
		} else {
			return serverUrl + str.replace(/&/, "?");
		}
	}

	var openWindow_1 = $.openWindow;

	$.openWindow = function(obj) {
		obj.show = {
			aniShow: 'pop-in'
		};
		if(obj.styles && obj.styles.titleNView){
			obj.styles.bounce = 'vertical';
			obj.styles.scrollIndicator = 'none';
			obj.styles.titleNView.autoBackButton = true;
//			obj.styles.titleNView.titleColor = '#FFFFFF';
//			obj.styles.titleNView.bounceBackground = '#2A333D';
		}
		if(obj.waiting) {
			obj.waiting.options = {
				background: 'rgba(255,255,255, 0)'
			}
		} else {
			obj.waiting = {
				options: {
					background: 'rgba(255,255,255, 0)'
				}
			}
		};
		return openWindow_1(obj);
	}

	//判断是否请求成功
	isRequestSuccess = function(data) {
		var ret = data.ret,
			code = (data.data || {}).code;
		if(ret && ret == 200 && code && code == 1) {
			return true;
		} else {
			plus.nativeUI.closeWaiting();
			if(typeof data == 'string') {
				var data = JSON.parse(data);
			}
			if(data) {
				if(data.data && data.data.msg) {
					plus.nativeUI.toast(data.data.msg);
				} else if(data.msg) {
					plus.nativeUI.toast(data.msg);
				}
			}
			return false;
		}
	}

	wAjax = function(data, success, error) {
		mui.ajax(makeurl(data), {
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				if(isRequestSuccess(data)) {
					return success(data);
				}
			},
			error: function(xhr, type, errorThrown) {
				plus.nativeUI.closeWaiting();
				plus.nativeUI.toast('网络连接错误');
				//异常处理；
				console.log(type);
				return error(type);
			}
		});
	}

	showWaiting = function() {
		return plus.nativeUI.showWaiting('正在加载...', {
			width: '40%',
			height: '20%',
			padding: '10%',
			background: "rgba(255,255,255,0)",
			style: 'black',
			color: "rgba(0,0,0,1)"
		})
	}

	/**
	 * 用户登录
	 **/

	owner.createState = function(name, callback) {
		var state = owner.getState();
		state.account = name;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};

		mui.ajax(makeurl(regInfo), {
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				return callback(data.data.msg);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log(type);
				return callback('网络连接错误');
			}
		});
		return callback();
	};

	/**
	 * 获取验证码
	 **/
	owner.getYanzhengma = function(data, callback) {
		callback = callback || $.noop;
		data = data || {};
		console.log(makeurl(data));
		mui.ajax(makeurl(data), {
			type: 'get', //HTTP请求类型
			timeout: 10000, //超时时间设置为10秒；
			success: function(data) {
				return callback(data.data.msg);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log(type);
				return callback('网络连接错误');
			}
		});

	}

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return(email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if(!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}
	/**
	 * 获取本地是否安装客户端
	 **/
	owner.isInstalled = function(id) {
		if(id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if(mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch(e) {}
		} else {
			switch(id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));