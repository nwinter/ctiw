# CTIW Language Specification

**Version 0.1.0** - Based on Clark's original whiteboard designs

## Overview

CTIW (Clark's Alternative to HTML/CSS) is a kid-friendly programming language for building web pages. It compiles to HTML and CSS.

### Design Principles

1. **Easy to type** - Uses `=` as the primary delimiter (easy key to find!)
2. **Visible structure** - Uses dots `.....` for indentation (you can see it!)
3. **Line-based** - Each line is one statement
4. **Forgiving** - Extra spaces and inconsistent casing are OK
5. **Fun** - Colors, buttons, and visual elements made simple

---

## Document Structure

Every CTIW document has three parts:

```ctiw
=CTIW=
... your code here ...
==CTIW==
```

- **Header**: `=CTIW=` starts the document
- **Body**: Your content and elements
- **Footer**: `==CTIW==` ends the document

---

## Basic Syntax

### Properties (Settings)

Set properties using the `=name=value=` pattern:

```ctiw
=title=Hello World=
=language=english=
=font-size=20=
```

### Elements

Create elements with just their name:

```ctiw
=button=
=img=
=line=
```

Or with properties:

```ctiw
=button=Click Me= color=blue=
=img=cat.png=
```

### Containers (divide)

The `divide` element is like HTML's `<div>` - it holds other things:

```ctiw
=divide=
.. =text=Hello inside!=
=divide=
```

### Indentation with Dots

Use dots to show what's inside what:

```ctiw
=divide= id:header=
.. =title=My Page=
.. =text=Welcome!=
=divide=

=divide= id:main=
.. =button=Click=
.. =button=Here=
=divide=
```

Each dot `.` represents one level of nesting.

---

## Elements Reference

### Text Elements

| Element | Description | Example |
|---------|-------------|---------|
| `title` | Page or section title | `=title=Hello=` |
| `text` | Regular text | `=text=Some words=` |
| `line` | Line break | `=line=` |

### Input Elements

| Element | Description | Example |
|---------|-------------|---------|
| `button` | Clickable button | `=button=Click Me=` |
| `password` | Password input field | `=password=` |
| `input` | Text input field | `=input=` |

### Layout Elements

| Element | Description | Example |
|---------|-------------|---------|
| `divide` | Container (like div) | `=divide= ... =divide=` |
| `img` | Image | `=img=picture.png=` |

### Special Elements

| Element | Description | Example |
|---------|-------------|---------|
| `(time)` | Shows current time | `=(time)=` |

---

## Properties Reference

### Element IDs

Give elements an ID using `id:name`:

```ctiw
=divide= id:header=
=divide= id:main=
=button= id:submit=
```

### Colors

Colors use hex codes (6 characters, no # needed):

```ctiw
=divide= color=FF0000=     (red)
=text= color=00FF00=       (green)
=button= color=BAF2Y9=     (custom color)
```

### Visibility

Show or hide element outlines:

```ctiw
=divide= outline=visible=
=divide= outline=invisible=
```

### Size

Set sizes with numbers:

```ctiw
=divide= size=100=
=font-size=20=
```

### Position

Set alignment:

```ctiw
=divide= in=middle=
=text= in=left=
=img= in=right=
```

---

## Complete Example

Here's a full CTIW page:

```ctiw
=CTIW=
=title=My First Page=
=language=english=
=font-size=20=

=divide= id:header= outline=visible= color=BAF2Y9=
.. =title=Welcome!=
=divide=

=divide= id:main=
.. =text=Enter your password:=
.. =password=
.. =line=
.. =button=Login=
=divide=

=(time)=
==CTIW==
```

This creates:
- A page titled "My First Page"
- A colored header box with "Welcome!"
- A main section with a password form
- A button to log in
- The current time at the bottom

---

## Compiles To

CTIW compiles to standard HTML and CSS. For example:

**CTIW:**
```ctiw
=CTIW=
=title=Hello=
=divide= id:box= color=FF0000=
.. =text=Red box!=
=divide=
==CTIW==
```

**HTML/CSS:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Hello</title>
  <style>
    #box { background-color: #FF0000; }
  </style>
</head>
<body>
  <div id="box">
    <p>Red box!</p>
  </div>
</body>
</html>
```

---

## Grammar (Technical)

For parser implementers:

```ebnf
document     = header, { statement }, footer ;
header       = "=", "CTIW", "=", newline ;
footer       = "=", "=", "CTIW", "=", "=", newline ;

statement    = [ line_number ], [ indent ], ( property | element | special ), newline ;
line_number  = digit, { digit } ;
indent       = ".", { "." } ;

property     = "=", identifier, "=", [ value ], "=" ;
element      = "=", element_name, [ "=", value, "=" ], { attribute }, "=" ;
special      = "=", "(", identifier, ")", "=" ;

attribute    = identifier, ( ":" | "=" ), value ;
value        = identifier | number | hex_color | string ;

element_name = "title" | "text" | "line" | "button" | "password"
             | "input" | "divide" | "img" | "link" ;

identifier   = letter, { letter | digit | "-" | "_" } ;
number       = digit, { digit } ;
hex_color    = hex_digit, hex_digit, hex_digit, hex_digit, hex_digit, hex_digit ;
string       = { any_char - "=" } ;

letter       = "a".."z" | "A".."Z" ;
digit        = "0".."9" ;
hex_digit    = digit | "a".."f" | "A".."F" ;
newline      = "\n" ;
```

---

## Error Messages

CTIW provides friendly error messages for kids:

| Error | Message |
|-------|---------|
| Missing `=CTIW=` | "Oops! Your CTIW code needs to start with =CTIW=" |
| Missing `==CTIW==` | "Don't forget to end your code with ==CTIW==" |
| Unknown element | "Hmm, I don't know what '{name}' is. Did you mean '{suggestion}'?" |
| Bad color | "Colors need 6 letters/numbers, like FF0000 for red!" |
| Unmatched divide | "This divide needs a matching end! Add =divide= to close it" |

---

## Future Ideas

Elements to consider adding:
- `=link=` - Hyperlinks
- `=list=` - Bullet lists
- `=sound=` - Audio
- `=video=` - Video
- `=game=` - Interactive games!
