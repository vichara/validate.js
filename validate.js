(function(window) {
    var 
        i = 0
        ,len
        ,fn = 'validate'
        ,resultArr
        ,validate = {
            
              config : {
                    consoleDebug : true //콘솔로그
            }
            , message : {
                 required : '필수 입력항목 [ #title# ] 입니다.'
                ,minLength : '[ #title# ] 에 최소길이 [{0}] 이상을 입력하세요.'
                ,maxLength : '[ #title# ] 에 최대길이 [{0}] 이하를 입력하세요.'
            }
            , eventArr : ['focus','keyup','keydown','blur']
            , thisTitle : null
            
            , console : function (a) {
                window.console && this.config.consoleDebug && console.log(a);
            }
            
            , trim : function(a) {
                return a.replace(/^\s+|\s+$/g, '');   
            }
            
            , isEmpty : function(val) {
                if (!val) {
                	return true;
                }
                
                if (typeof (val) === 'string' && this.trim(val) === '') {
                	return true;
                }
                
                if (typeof (val) === 'function' 
                    || typeof (val) === 'number' 
                        || typeof (val) === 'boolean' 
                            || Object.prototype.toString.call(val) === '[object Date]') {
                	return false;
                }
                
                if (val.length === 0)  { 
                	return true;
                }   
                
                if (typeof (val) === "object") {
                    var r = true;
                
                    for (var f in val) {
                        r = false;
                    }
                
                    return r;
                }
                
                return false;
            }
            
            , isNotEmpty : function(val) {
                return !this.isEmpty(val);
            }
            
            , addEventListener : function(obj, test) {
                for (i=0, len = this.eventArr.length; i<len; i++) {
                    if (obj.addEventListener) {
                        obj.addEventListener(this.eventArr[i], test, false);
                        this.console('addEventListener');
                    }
                    else {
                        obj.attachEvent("on"+this.eventArr[i], test);
                        this.console('attachEvent');
                    }
                }
            }
            
            , fieldValidation : function (_objs, _callBack) {
            	var callBack = _callBack || function (inp, message){
            		alert(message);
            		inp.focus();
            		return false;
            	};
            	
            	if (!_objs){
            		return false;
            	}
            	
            	if (Object.prototype.toString.call( _objs ) !== '[object Array]') {
            		return false;
            	}
            	
            	resultArr = [];
            	
            	var objs,attr,result_inp,subBoo = false;
            	for (i = 0, len = _objs.length; i < len; i++) {
            		objs = _objs[i]['inp']
            		_objs[i]['inp'] = undefined;
            		attr = _objs[i];
            		subBoo = this.fieldValidationSub(objs, attr);
            		if (!subBoo) {
            			break;
            		}
            	}
            	
            	if ( typeof callBack  === 'function' && !resultArr) {
            		callBack(resultArr[0], resultArr[1]);
            	}
            	
            	return subBoo;
            }
            
            
            , fieldValidationSub : function (objs, attr) {
                this.console('start');
                
                if (!objs || !attr) {
                    return false;
                }
                
                var obj;
                
                if (objs.length) {
                    for (i=0, len = objs.length; i<len; i++) {
                        obj = objs[i];
                        
                        //노드 체크
                        if (!this.checkNode(obj)) {
                        	return false;
                        }
                        
                        //타이틀 유무 설정
                        if (!this.checkTitle(obj, attr)) {
                        	return false;
                        }
                        
                        //필수 입력값 체크
                        if (!this.validationRequired(obj, attr)) {
                        	return false;
                        }
                        
                        //길이 체크
                        if (!this.validationLength(obj, attr)) {
                        	return false;
                        }
                    }
                }
                else {
                    obj = objs;
                    
                    //노드 체크
                    if (!this.checkNode(obj)) {
                    	return false;
                    }
                    
                    //타이틀 유무 설정
                    if (!this.checkTitle(obj, attr)) {
                    	return false;
                    }
                    
                    //필수 입력값 체크
                    if (!this.validationRequired(obj, attr)) {
                    	return false;
                    }
                    
                    //길이 체크
                    if (!this.validationLength(obj, attr)) {
                    	return false;
                    }
                }
                
                return true;
            }
            
            , eventHandler : function (arr) {
            	if (!arr){
            		return;
            	}
            	
            	if (Object.prototype.toString.call( arr ) !== '[object Array]') {
            		return;
            	}
            	
            	var objs,attr;
            	for (i = 0, len = arr.length; i < len; i++) {
            		objs = arr[i]['inp']
            		arr[i]['inp'] = undefined;
            		attr = arr[i];
            		this.eventHandlerSub(objs, attr);
            	}
            }
            	
            , eventHandlerSub : function (objs, attr) {
                this.console('eventHandler start');
                
                if (!objs || !attr) {
                    return;
                }
                
                var obj
                ,thisObj = this;
                
                if (objs.length) {
                    for (i=0, len = objs.length; i<len; i++) {
                        obj = objs[i];
                        //노드 체크
                        if (!this.checkNode(obj)) {
                        	return;
                        }
                        
                        this.addEventListener(obj, function (){
                            //길이 체크
                        	thisObj.validationLength(obj, attr, true);
                            
                            //대소문자 변경
                        	thisObj.toCase(obj, attr);
                            
                        });
                    }
                }
                else {
                    obj = objs
                    ,thisObj = this;
                    
                    //노드 체크
                    if (!this.checkNode(obj)) {
                    	return;
                    }
                    
                    this.addEventListener(obj, function (){
                        //길이 체크
                    	thisObj.validationLength(obj, attr, true);
                        
                        //대소문자 변경
                    	thisObj.toCase(obj, attr);
                    });
                }
                
                return true;
            }
            
            , checkTitle : function (obj, attr) {
                if (!attr['title'] && !obj.getAttribute("title")) {
                	resultArr.push(obj);
                	resultArr.push('title 속성이 지정되어 있지 않습니다.');
//                    alert('title 속성이 지정되어 있지 않습니다.');
                    return false;
                }
                
                this.thisTitle = attr['title'] || obj.getAttribute("title");
                
                return true;
            }
            
            , checkNode : function (obj) {
                
                switch(obj.nodeName.toUpperCase()) {
                    case 'INPUT'    :
                    case 'TEXTAREA' :
                    case 'SELECT'   :
                        return true;
                        break;
                    default :
//                        this.console(obj.nodeName+'은 사용 할 수 없습니다.');
//                        alert(obj.nodeName+'은 사용 할 수 없습니다.');
                    	resultArr.push(obj);
                		resultArr.push(obj.nodeName+'은 사용 할 수 없습니다.');
                        return false;
                        break;
                }
            }
            
            , validationRequired : function (obj, attr) {
                if (attr['required'] || attr['required'] === 'true') {
                    if (this.isEmpty(obj.value)) {
//                        alert(this.messageConverter(this.message['required'],this.thisTitle));
//                        this.errFocus(obj);
                    	
                    	resultArr.push(obj);
                		resultArr.push(this.messageConverter(this.message['required'],this.thisTitle));
                        return false;
                    } 
                }
                
                return true;
            }
            
            , validationLength : function (obj, attr, flag) {
                var minLength = attr && attr['minLength'] || null;
                if (minLength) {
                    minLength = Number(minLength);
                    
                    if (!flag && obj.value.length < minLength) {
//                        alert(this.messageConverter(this.message['minLength'],this.thisTitle,[minLength]));
//                        this.errFocus(obj);
                        resultArr.push(obj);
                		resultArr.push(this.messageConverter(this.message['minLength'],this.thisTitle,[minLength]));
                        return false;
                    }
                }
                var maxLength = attr && attr['maxLength'] || null;
                if (maxLength) {
                    maxLength = Number(maxLength);
                    
                    if (!flag && obj.value.length > maxLength) {
//                        alert(this.messageConverter(this.message['maxLength'],this.thisTitle,[maxLength]));
//                        this.errFocus(obj);
                        resultArr.push(obj);
                		resultArr.push(this.messageConverter(this.message['maxLength'],this.thisTitle,[maxLength]));
                        return false;
                    }
                    else if (flag && obj.value.length > minLength) {
                        obj.value = obj.value.substring(0,maxLength);
                    }
                }
                
                return true;
            }
            
            , toCase : function (obj, attr) {
                if (!attr) {
                	return;
                }
                
                if (attr['toCase'].toUpperCase() === 'UPPER'){
                    obj.value = obj.value.toUpperCase();
                }
                else if (attr['toCase'].toUpperCase() === 'LOWER'){
                    obj.value = obj.value.toLowerCase();
                }
            }
            
            , messageConverter : function (message, title, arr) {
                var tmpMessage = message.replace('#title#',title);
                
                if (!arr) {
                    return tmpMessage;
                }
                
                for (i=0, len = arr.length; i<len; i++) {
                    if (tmpMessage.indexOf('{' + i + '}') > -1) {
                        tmpMessage = tmpMessage.replace('{' + i + '}',arr[i]);
                    }
                }
                
                return tmpMessage;
            }
            
            , errFocus : function (obj) {
                obj.focus();
            }
        };


    window[fn] = window[fn] || {}
   ,window[fn] = validate;
})(window);
