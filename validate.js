/*!
 *  
 *  validate.js
 *  MIT license
 *
 */
(function( window ) {
   var i=0 
   ,len
   ,obj
   ,objs
   ,attr
   ,callBack
   ,callBackObj = {}
   ,$VALIDATE = {
            /* *
             *  validate.eventHandler -> 실시간 변경에 대한 eventHandler (jquery doc ready,onload 에서 사용)
             *  validate.fieldValidation -> 최종 form 검증 submit 제출전 체크 함수 (onsubmit에서 사용)
             *  
             *  
             *  argument1 -> selector 객체 (필수)
             *  argument2 -> 속성 (필수)
             *  argument3 -> callBackFunction (옵션)
             *  
             *  fieldValidation -> 유효성에 맞지 않으면 alert 메세지 띄움
             *  
             *  eventHandler -> 유효성에 맞지 않으면 보정 (maxlength,toCase,dataType)
             *  
             *  
             *  ------------- 속성 목록  -------------
             *  
             *  required : true (필수입력)
             *  min : 숫자 범위 (최소 입력)
             *  max : 숫자 범위 (최대 입력)
             *  readOnly : true {읽기 전용 속성 (false 없음)}
             *  toCase :  upper,lower (대문자,소문자)
             *  dataType : 허용할 타입 명시( 예 -> NHS 숫자,한글,특수문자)
             *  N - 숫자
             *  E - 영문
             *  H - 한글
             *  S - 특수문자
             *  ------------- 속성 목록  -------------
             *  
             *  
             *  fieldValidation 에서 사용 가능한 속성
             *  required, min, max, dataType
             *  
             *  
             *  eventHandler 에서 사용 가능한 속성
             *  max, readOnly, toCase, dataType
             *  
             *  
             */
            
              config : {
                   consoleDebug : true // 콘솔로그
                  ,requiredEmpty : true // 공백도 필수입력
                  ,maxNextFocus : true // max에 일치할경우 다음 element로 focus(eventHandler 전용)
                  
                  , messages : {
                      required : '필수 입력항목 [ {0} ] 입니다.'
                      ,minLength : '[ {0} ] 에 최소길이 [{1}] 이상을 입력하세요.'
                      ,maxLength : '[ {0} ] 에 최대길이 [{1}] 이하를 입력하세요.'
                      ,dataType : '[ {0} ] 에 [{1}]만 입력할 수 있습니다.'
                      ,requiredTitle : 'title 속성이 지정되어 있지 않습니다.'    
                      ,devAlert : '은 사용 할 수 없습니다.'    
                      ,devAlert2 : '객체 혹은 속성이 지정되어 있지 않습니다.'   
                      ,devAlert3 : '속성이 올바르지 않습니다.'
                      ,fileBlackList : '[ {0} ] 에 해당[{1}]\n확장자는 업로드 할 수 없습니다.'
                      ,fileWhiteList : '[ {0} ] 에 해당[{1}]\n확장자만 업로드 할 수 있습니다.'
                      ,num : '숫자'
                      ,eng : '영문'
                      ,han : '한글'
                      ,special : '특수문자'
                  }
                  
                  , reg : {
                       NUM : '0-9'
                      ,ENG : 'a-zA-Z'
                      ,HAN : 'ㄱ-힣'
                      ,SP : '~!#$^&*=+|:;?"<,.>'
                      ,DOT : '.0-9'
                  }
                  
                  , event : ['focus','keyup','keydown','blur']
                  
                  , alert : function (a) {
                      alert(a);
                  }
                  
                  , focus : function (obj) {
                      obj && obj.focus();
                  }
            }
   
            , setDefaults : function (obj) {
                if (typeof (obj) !== 'object') {
                    return;
                }
                
                for(var oriKey in this.config) {
                    for(var key in obj) {
                        if (oriKey === key) {
                            this.config[key] = obj[key];
                        }
                    }
                }
            }
            
            , console : function (a) {
                window.console && this.config.consoleDebug && console.log(a);
            }
            
            , trim : function (a) {
                return a.replace(/^\s+|\s+$/g, '');   
            }
            
            , isEmpty : function (val) {
                if (val == null) {
                    return true;
                }
                
                if (this.config.requiredEmpty && typeof (val) === 'string' && this.trim(val) === '') {
                    return true;
                }
                else if (!this.config.requiredEmpty && typeof (val) === 'string' && val === '') {
                    return true;
                }
                
                if (typeof (val) === 'function' 
                    || typeof (val) === 'number' 
                        || typeof (val) === 'boolean' 
                            || Object.prototype.toString.call(val) === '[object Date]') {
                    return false;
                }
                
                if (val.length === 0) {
                    return true;
                }
                
                if (typeof (val) === 'object') {
                    var r = true;
                    
                    for (i=0, len = val.length; i<len; i++) {
                        r = false;
                    }
                
                    return r;
                }
                
                return false;
            }
            
            , isNotEmpty : function (val) {
                return !this.isEmpty(val);
            }
            
            , addEventListener : function (_obj, _fn) {
                
                for (i=0, len = this.config.event.length; i<len; i++) {
                    if (_obj.addEventListener) {
                        _obj.addEventListener(this.config.event[i], _fn, false);
                    }
                    else {
                        _obj.attachEvent('on' + this.config.event[i], _fn);
                    }
                }
            }
            
            , callBack : function (_boo, _objs) {
                try {
                    if (typeof _boo !== 'undefined')
                        return _boo;
                }
                finally {
                    
                    if (!callBackObj) {
                        callBackObj = {};
                    }
                    
                    callBackObj['return'] = _boo;
                    
                    callBackObj['data'] = _objs;
                    
                    if (callBack && typeof(callBack) === "function") {
                        callBack(callBackObj);
                    }
                    
                    clear();
                }
            }
            
            , fieldValidation : function (_attr) {
                if (!_attr) {
                    this.messageAlert('devAlert2');
                    return;
                }
                
                if ( Object.prototype.toString.call( _attr ) !== '[object Array]') {
                    this.messageAlert('devAlert2');
                    return;
                }
                
                var returnBoo = true
                for ( var j=0, len2 = _attr.length; j < len2; j++) {
                    if (!this.fieldValidationMain(_attr[j]['target'], _attr[j], _attr[j]['callBack'])) {
                        returnBoo = false;
                        break;
                    }
                }
                
                return returnBoo;
            }
            
            , fieldValidationMain : function (_objs, _attr, _callBack) {
                
                if (!_attr) {
                    this.messageAlert('devAlert2');
                    return this.callBack(false, _objs);
                }
                
                try {
                    
                    objs = _objs;
                    attr = _attr;
                    callBack = _callBack;
                    
                    if (objs && typeof objs === 'string' && document.getElementById(objs)) {
                        objs = document.getElementById(objs);
                    }
                    
                    if (!objs) {
                        this.messageAlert('devAlert2');
                        return;
                    }
                    
                    this.convertAttribute();
                    
                    len = objs.length;
                    
                    if (len) {
                        for (i=0; i<len; i++) {
                            obj = objs[i];
                            
                            return this.callBack(this.fieldValidationSub(obj),obj);
                        }
                    }
                    else {
                        return this.callBack(this.fieldValidationSub(objs),objs);
                    }
                }
                catch (e) {
                    if (e === 'E1') {
                        this.config.alert(e);
                    }
                    else {
                        this.console(e);
                    }
                }
            }
            
            , fieldValidationSub : function (_obj) {
                
                // Element 체크
                if (!this.checkElement(_obj)) {
                    return false;
                }
                
                // 타이틀 유무 설정
                if (!this.checkTitle(_obj)) {
                    return false;
                }
                
                callBackObj.title = attr['title'] || _obj.getAttribute('title');
                
                // 필수 입력값 체크
                if (!this.validationRequired(_obj)) {
                    return false;
                }
                
                // 길이 체크
                if (!this.validationLength(_obj)) {
                    return false;
                }
                
                // 데이터 타입 검증
                if (!this.dataType(_obj)) {
                    return false;
                }
                
                //fileCheck
                if (!this.fileCheck(_obj)) {
                    return false;
                }
                
                return true;
            }
            
            , eventHandler : function (_attr) {
                if (!_attr) {
                    this.messageAlert('devAlert2');
                    return;
                }
                
                if ( Object.prototype.toString.call( _attr ) !== '[object Array]') {
                    this.messageAlert('devAlert2');
                    return;
                }
                
                for ( var j=0, len2 = _attr.length; j < len2; j++) {
                    this.eventHandlerMain(_attr[j]['target'], _attr[j], _attr[j]['callBack']);
                }
            }
            
            
            , eventHandlerMain : function (_objs, _attr, _callBack) {
                if (!_attr) {
                    this.messageAlert('devAlert2');
                    return;
                }
                
                objs = _objs;
                attr = _attr;
                callBack = _callBack;
                
                
                if (objs && typeof objs === 'string' && document.getElementById(objs)) {
                    objs = document.getElementById(objs);
                }
                
                if (!objs) {
                    this.messageAlert('devAlert2');
                    return;
                }
                
                try {
                    
                    this.convertAttribute();
                    
                    len = objs.length;
                    
                    if (len) {
                        
                        for (i=0; i<len; i++) {
                            obj = _objs[i];
                            this.eventHandlerSub(obj);
                            this.callBack(undefined, obj);
                        }
                    }
                    else {
                        this.eventHandlerSub(objs);
                        this.callBack(undefined, objs);
                    }
                }
                catch(e) {
                    if (e === 'E1') {
                        this.config.alert(e);
                    }
                    else {
                        this.console(e);
                    }
                }
            }
            
            
            , eventHandlerSub : function (_obj) {
                // Element 체크
                if (!this.checkElement(_obj)) {
                    return;
                }
                
                // readonly check
                if (this.readOnly(_obj)) {
                    return;
                }
                
                var parentThis = this
                ,eventThis;
                
                _obj['attr__'] = attr;
                _obj['callBack__'] = callBack;
                
                this.addEventListener(_obj, function () {
                    eventThis = this.event && this.event.srcElement || this;
                    
                    attr = eventThis['attr__'] && eventThis['attr__'];
                    callBack = eventThis['callBack__'] && eventThis['callBack__'];
                    
                    
                    // 길이 체크
                    parentThis.validationLength(eventThis, true);
                    
                    // 대소문자 변경
                    parentThis.toCase(eventThis);
                    
                    // 데이터 타입 검증
                    parentThis.dataType(eventThis, true);
                    
                    // callBack
                    parentThis.callBack(true, eventThis);
                });
            
                return true;
            }
            
            , fileCheck : function (_obj) {
                if (this.isNotEmpty(_obj.value) && _obj.getAttribute('type').toUpperCase() === 'FILE' && attr['file']) {
                    
                    var tmpValue = _obj.value.split('.').pop().toUpperCase();
                    
                    if (attr['file']['blackList']) {
                        for ( i=0, len=attr['file']['blackList'].length; i < len; i++ ) {
                            if (tmpValue !== attr['file']['blackList'][i].toUpperCase()) {
                                continue;
                            }
                            
                            this.messageAlert('fileBlackList',[callBackObj.title, attr['file']['blackList'].join(',')]);
                            return false;
                        }
                    }
                    
                    if (attr['file']['whiteList']) {
                        for ( i=0, len=attr['file']['whiteList'].length; i < len; i++ ) {
                            if (tmpValue === attr['file']['whiteList'][i].toUpperCase()) {
                                continue;
                            }
                            
                            this.messageAlert('fileWhiteList',[callBackObj.title, attr['file']['whiteList'].join(',')]);
                            return false;
                        }
                    }
                }
                
                return true;
            }
            
            , checkTitle : function (_obj) {
                if (!attr['title'] && !_obj.getAttribute('title')) {
                    this.messageAlert('requiredTitle');
                    return false;
                }
                
                return true;
            }
            
            , isUseElement : function (_obj) {
                
                switch (_obj.nodeName.toUpperCase()) {
                    case 'INPUT'    :
                    case 'TEXTAREA' :
                    case 'SELECT'   :
                        return true;
                        break;
                    default :
                        return false;
                        break;
                }
            }
            
            , checkElement : function (_obj) {
                
                if (!this.isUseElement(_obj)) {
                    this.console(_obj.nodeName + this.config.messages.devAlert);
                    this.message('devAlert');
                    return false;
                }
                
                return true;
            }
            
            , validationRequired : function (_obj) {
                
                if (!attr) {
                    return;
                }
                
                if (attr['required'] || attr['required'] === 'true') {
                    if (this.isEmpty(_obj.value)) {
                        this.messageAlert('required',[callBackObj.title]);
                        this.config.focus(_obj);
                        return false;
                    } 
                }
                
                return true;
            }
            
            , validationLength : function (_obj, _isEvent) {
                
                if (!attr) {
                    return;
                }
                
                if (!_isEvent) {
                    var minLength = attr['min'];
                    if (minLength) {
                        minLength = Number(minLength);
                        
                        // fieldValidator
                        if (_obj.value.length < minLength) {
                            this.messageAlert('minLength',[callBackObj.title, minLength]);
                            this.config.focus(_obj);
                            return false;
                        }
                    }
                }

                var maxLength =  attr['max'];
                if (maxLength) {
                    maxLength = Number(maxLength);
                    
                    if (_obj.value.length > maxLength) {
                        
                        // event
                        if (_isEvent) {
                            _obj.value = _obj.value.substring(0, maxLength);
                        }
                        // fieldValidator
                        else {
                            this.messageAlert('maxLength',[callBackObj.title, maxLength]);
                            this.config.focus(_obj);
                            return false;
                        }
                    }
                }
                
                return true;
            }
            
            , toCase : function (_obj) {
                if (!attr || !attr['toCase']) {
                    return;
                }
                
                if (attr['toCase'].toUpperCase() === 'UPPER') {
                    _obj.value = _obj.value.toUpperCase();
                }
                else if (attr['toCase'].toUpperCase() === 'LOWER') {
                    _obj.value = _obj.value.toLowerCase();
                }
            }
            
            , readOnly : function (_obj) {
                if (!attr) {
                    return;
                }
                
                if (attr['readOnly'] || attr['readOnly'] === 'true') {
                    this.fnReadOnly(_obj);
                    return true;
                }
            }
            
            , fnReadOnly : function (_obj) {
                _obj.readOnly = true;
            }
            
            , dataType : function (_obj, _isEvent) {
                if (!attr) {
                    return true;
                }
                
                var dataType = attr['dataType']
                ,checkArrFlag = []
                ,checkArrFlagStr = [];
                
                if (!dataType) {
                    return true;
                }
                                
                if (dataType.indexOf('N') > -1) {
                    checkArrFlag.push(this.config.reg.NUM);
                    checkArrFlagStr.push(this.config.messages.num);
                }
                
                if (dataType.indexOf('E') > -1) {
                    checkArrFlag.push(this.config.reg.ENG);
                    checkArrFlagStr.push(this.config.messages.eng);
                }
                
                if (dataType.indexOf('H') > -1) {
                    checkArrFlag.push(this.config.reg.HAN);
                    checkArrFlagStr.push(this.config.messages.han);
                }
                
                if (dataType.indexOf('S') > -1) {
                    checkArrFlag.push(this.config.reg.SP);
                    checkArrFlagStr.push(this.config.messages.special);
                }
                
                if (checkArrFlag.length > 0) {
                    var regexNotIn = new RegExp('[^' + checkArrFlag.join('') + ']', 'g');
                    
                    
                    if (regexNotIn.test(_obj.value)) {
                        
                        // event
                        if (_isEvent) {
                            _obj.value = _obj.value.replace(regexNotIn,'');
                        }
                        // fieldValidator
                        else {
                            this.messageAlert('dataType',[callBackObj.title, checkArrFlagStr.join(',')]);
                            this.config.focus(_obj);
                            return false;
                        }
                        
                    }
                }
                
                return true;
            }
            
            , convertAttribute : function () {
//                if (!attr || typeof attr === 'object') {
//                    return;
//                }
//                
//                var resultAttr = {};
//                
//                if (attr.indexOf('|') > -1) {
//                    var arr = attr.split('|')
//                    ,idx1
//                    ,idx2;
//                    
//                    for (i=0, len = arr.length; i<len; i++) {
//                        idx1 = arr[i].indexOf('[');
//                        idx2 = arr[i].indexOf(']');
//                        
//                        if (idx1 > -1 && idx2 > -1) {
//                            resultAttr[arr[i].substring(0,idx1)] = arr[i].substring((idx1+1),idx2);
//                        }
//                        else if (idx1 == -1 && idx2 == -1) {
//                            resultAttr[arr[i]] = true;
//                        }
//                        else {
//                            throw 'E1';
//                        }
//                    }
//                    
//                    attr = resultAttr;
//                    
//                }
//                else {
//                    resultAttr[attr] = true;
//                    
//                    attr = resultAttr;
//                }
            }
            
            , messageAlert : function (_key, _arr) {
                var message = attr.message && attr.message[_key] || this.config.messages[_key];
                
                this.config.alert(this.messageConverter(message, _arr));
            }
            
            , messageConverter : function (_message, _arr) {
                
                if (!_arr) {
                    return _message;
                }
                
                for (i=0, len = _arr.length; i<len; i++) {
                    if (_message.indexOf('{' + i + '}') === -1) {
                        break;
                    }
                    
                    _message = _message.replace('{' + i +'}',_arr[i]);
                }
                
                return _message;
            }
    };
   
    function clear() {
       i    = null; 
       len = null; 
       obj  = null; 
       objs = null; 
       attr = null; 
       callBack = null; 
    }
    
    window.validate = $VALIDATE;
})( window );
