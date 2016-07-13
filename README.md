# doug16k.com

## Project Layers

### Sequelize

Uses Postgres behind sequelize.js

### Field definition layer

All of the behaviors of a field are defined at this
layer.

- Type
  - Boolean
  - String
  - Integer
  - Currency
- Control
  - ControlName
  - Runtime properties
  Runtime properties are ones that are often (but not necessarily) bound to the visual rendering.
  - Design time variables
  Variables which are set per instance at design time
- s
 
### Runtime properties

Runtime properties are bound to the visual representation. Changing a runtime property is likely to fire some code execution to perform some kind of visual update.

Some basic facilities are are the foundation of the runtime property system.

#### Standard properties

Several properties have consistent meaning across controls

- `children`: Array of contained objects. May be `null`, if no children.
- `value`: Depends
  - for an `<input>` or `<textarea>` it would be the text, 
  - for a `<select>` it is the `value` of the selected `<option>`,
  - for an `<input type="radio">` it is the value of the selected radio button
  - for an `<input type="checkbox">` it is `true` if the check box is checked
  - for an `<input type="color">` it is the value of the selected color
  - for an `<input type="file">` it is the `FileReader` of the file or `null`
- `options`: Only `<select>` and `<input type="radio">` has options
- `disabled`: When this is `true`, the control is disabled and cannot be changed by the user
- `frozen`: When this is `true`, the control will not render itself, it will only remember the need to render itself.
- `valid`: `true` if the last validator execution was successful
- `label`:  Human-friendly label, bound to the text of the label element. `null` if no label exists.
- `name`: Programmatic name of control

#### Standard events

##### `formload` and `formunload` 
Fired on every element when loading and unloading part of the document

##### `formactivate` and `formdeactivate`
Fired after controls have had their bound values set, and before controls become unbound from their objects.

##### `formchange`
Fired when something in the form may have changed.

##### `formvalid` and `forminvalid`
Fired when the control becomes valid and invalid. Redundant events are filtered out.

##### `formedit`
Fired after the form has activated and is beginning an editing session. Upon `preventDefault`, editing is prevented.

##### `formcommit`
Fired before the form is committed to the database. Upon `preventDefault`, committing is prevented.

#### Property utilities

- Bind a string property to the `TextNode` of an element.
- Bind a boolean property to a `checked` property and listen for `change` events.
- Bind an array and two property names or functions to a sequence of `<option>` elements with `value` attributes and `TextNode` children, to a `<select>`, or, to a sequence of `<input type="radio">` radio buttons.

#### Property dependencies

A dependency graph can be constructed which defines which properties should be recomputed when another property changes. These can span across controls, so for example, a `<select>` element's `<option>` items can depend upon the `value` of another `select`.

