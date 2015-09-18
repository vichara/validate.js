# validate.js

javascript 폼검증

<iframe width="100%" height="300" src="//jsfiddle.net/v2tcfxsj/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>


입력시 폼검증 eventHandler

호출시 폼검증 fieldValidation

```javascript

	
	same
	target : "id" == document.getElementById("id") == $("#id") 
	
	
	var d = document;
	
	validate.eventHandler([
				{target : d.getElementById('tmp1'), dataType : 'N', max : 3}
				,{target : d.getElementById('tmp2'), dataType : 'E', max : 3}
				,{target : 'tmp3', dataType : 'H', max : 3}
				,{target : d.getElementById('tmp4'), dataType : 'S', max : 3}
				,{target : d.getElementById('tmp5'),  max : 3}
				,{target : d.getElementById('tmp6'),  readOnly : true}
			]);
```
