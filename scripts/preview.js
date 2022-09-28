//document on load

document.addEventListener("DOMContentLoaded", () => {
  //get board element
  const board = document.querySelector("#board");

  //add a static message
  //board.innerHTML = "Grow a beautiful tree";

  const vscode = acquireVsCodeApi();
  function getSchematext() {
    vscode.postMessage({
      command: "get schema text",
    });
  }
  getSchematext();

  const refreshBtn = document.querySelector("#refresh");
  refreshBtn.addEventListener("click", (e) => {
    console.log("Refresh->,", e);
    board.innerHTML = "";
    getSchematext();
  });
});

//add eventListener to the window
window.addEventListener("message", (event) => {
  const message = event.data;
  console.log("message2", event);
  const text = message.text;
  //call parser
  if (message.command === "sendSchemaInfo") {
    // const [schemaArr, returnObj] = parser(text);
    const [schemaArr, queryMutation, enumArr, inputArr] = JSON.parse(
      message.text
    );
    console.log("here it comes", [schemaArr, queryMutation, enumArr, inputArr]);
    draw(queryMutation, schemaArr, enumArr);
    return;
  }
});

// //display function
function draw(qmArr, schemaArr, enumArr) {
  const enumLeaf = [];
  enumArr.forEach((e) => {
    enumLeaf.push(e.name);
  });
  console.log("enum leaf array", enumLeaf);
  const scalarTypes = ["Int", "Float", "String", "Boolean", "ID"];
  const tree = document.createElement("div");
  tree.setAttribute("class", "tree");
  board.appendChild(tree);
  //create root ul
  const treeUL = document.createElement("ul");
  tree.appendChild(treeUL);
  //for every root in array we create a list item
  qmArr.forEach((root) => {
    const li = document.createElement("li");
    li.setAttribute("data-fields", JSON.stringify(root.fields));
    li.setAttribute("class", "queryType-alt");
    li.innerHTML = `<span>${root.name}</span>`;
    //create childUL
    const childUl = document.createElement("ul");
    childUl.setAttribute("class", "fieldGroup");
    for (const field in root.fields) {
      //console.log("true", root.fields[field]);

      //create buttons within li
      const childLi = document.createElement("li");
      childLi.setAttribute("class", "fieldType-alt");

      if (scalarTypes.includes(root.fields[field])) {
        console.log(root.fields[field], "true");
        childLi.textContent = `${field}:${root.fields[field]}`;
      } else if (enumLeaf.includes(root.fields[field])) {
        console.log("found enum leaf", root.fields[field]);
        childLi.textContent = `${field}:${root.fields[field]}`;
        childLi.setAttribute("font-weight", "600");
      } else {
        const btn = document.createElement("button");
        btn.textContent = `${field}:${root.fields[field]}`;
        btn.addEventListener("click", function (e) {
          //check root.fields[field] === int, str, boolean, do nothing
          e.stopPropagation();
          const parent = e.target.parentNode;
          const [field, fieldtype] = parent.textContent.split(":");
          console.log(field, fieldtype);
          //if not, return root.field, add nested structure
          // console.log(array);
          schemaArr.forEach((e) => {
            if (fieldtype === e.name) {
              console.log("e", e);
              drawNext(schemaArr, btn, e, enumLeaf); //array, btn buyer
            }
          });
        });
        childLi.appendChild(btn);
      }
      //append to list item

      childUl.appendChild(childLi);
      //hide children initially
      childUl.hidden = true;
      //TODO: eventlistener here
    }
    li.appendChild(childUl);
    li.addEventListener("click", function (e) {
      //console.log(e.target);
      //locate children
      const children = this.querySelector("ul");
      children.hidden = !children.hidden;
    });
    treeUL.appendChild(li);
    //console.log(root);
  });
  return;
}

//function draw the next level fields
function drawNext(array, node, rootObj, enumLeaf) {
  const arrayTypes = ["Int", "Float", "String", "Boolean", "ID"];
  //console.log('drawNext, -> ', array, node, rootObj);
  //create childUL
  const childUl = document.createElement("ul");
  childUl.setAttribute("class", "fieldGroup");
  for (const field in rootObj.fields) {
    //create buttons within li

    const childLi = document.createElement("li");
    childLi.setAttribute("class", "fieldType-alt");

    if (arrayTypes.includes(rootObj.fields[field])) {
      childLi.textContent = `${field}:${rootObj.fields[field]}`;
    } else if (enumLeaf.includes(rootObj.fields[field])) {
      childLi.textContent = `${field}:${rootObj.fields[field]}`;
      childLi.setAttribute("style", "color:green");
    } else {
      const btn = document.createElement("button");

      btn.textContent = `${field}:${rootObj.fields[field]}`;
      //append to list item
      childLi.appendChild(btn);
      //hide children initially
      // childUl.hidden = true;
      btn.addEventListener("click", function (e) {
        console.log("text");
        //check root.fields[field] === int, str, boolean, do nothing
        e.stopPropagation();
        const parent = e.target.parentNode;
        const [field, fieldtype] = parent.textContent.split(":");
        console.log(field, fieldtype);
        //if not, return root.field, add nested structure
        console.log(array);
        array.forEach((e) => {
          if (fieldtype === e.name) {
            drawNext(array, btn, e, enumLeaf);
          }
        });
      });
    }

    childUl.appendChild(childLi);
  }
  //node is the button but we want to appendUl
  node.addEventListener("click", function (e) {
    //locate children
    const children = this.parentNode.querySelector("ul");
    console.log("children", children);
    children.hidden = !children.hidden;
  });
  node.parentNode.appendChild(childUl);
  return;
}
