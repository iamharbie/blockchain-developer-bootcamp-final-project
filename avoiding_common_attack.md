# Avoiding Commmon Attacks

## SWC-100 Visibility Not Set

Attempted to always provide a visibility to prevent unintended use of functions.

## SWC-103 Floating pragma

Set compiler pragma to a fixed version of `0.8.4` to prevent using incompatible functions.

## Use modifiers Only for Validation

Ensured that modifiers are only used for input validation with require and do not contain any substantive logic
