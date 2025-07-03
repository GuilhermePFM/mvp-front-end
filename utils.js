const log_api_error = (response) =>{
    if (response.status === 400) {
        console.error('Bad request');
        // Handle bad request (e.g., invalid data)
      } else if (response.status === 401) {
        console.error('Unauthorized');
        // Handle unauthorized access
      } else if (response.status === 500) {
        console.error('Server error');
        // Handle server error
      } else {
        console.error(`Unexpected status code: ${response.status}`);
      }
}


function createDropdown(baseid, options, selected=null){
  var select_menu = createHtmlObject('select', objectid=baseid, extraclasses=["form-select"], 
      kwargs={"aria-label":"Default select example"});
  options.forEach(option => {
    var option_name = option[0]
    var option_id = option[1]
    var option_as_node = document.createTextNode(option_name);
    var option_as_div = createHtmlObject('div', objectid=null, extraclasses=['overflow-auto'], 
      kwargs={}, content=option_as_node);
      var option_kwargs={"value":option_id}
      if (option_name === selected){
          option_kwargs["selected"] = null;
      }
      var option_item = createHtmlObject('option', objectid=null, extraclasses=[], 
      kwargs=option_kwargs, content=option_as_div);
      select_menu.appendChild(option_item);
    });
    return select_menu;
};

function createHtmlObject(name, objectid=null, extraclasses=[], kwargs={}, content=null){
  let element = document.createElement(name);
  if (objectid){
    element.id = objectid;
  }
  if (extraclasses.length>0){
      extraclasses.forEach(extraclass => {
      if(/\s/g.test(extraclass)){
        extraclass.split(" ").forEach(extraclass => {
          element.classList.add(extraclass);
        })
      } else{
        element.classList.add(extraclass);
      }
    })
  }
  if(kwargs){
    Object.entries(kwargs).forEach(([key, value]) => {
      if (value){
        element[key] = value;
        // element.createAttribute(key, value)
      } else{
        var attribute = document.createAttribute(key);
        element.setAttributeNode(attribute);
      }
  })}

  if(content){
    element.appendChild(content);
  }
  
  return element;
}
