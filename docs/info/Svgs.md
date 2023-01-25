# SVGs and Safari

We do not set a width and height on SVGs so that they can adapt to their parents size. Often we use a flex-box to achieve this goal and center the icon as well, which works fine on chrome, however Webkit browsers.

## In Conclusion

Do this instead:

```jsx
// Use grid instead of flex
<div css={{ display: 'grid' }}>
  <Icon />
</div>
```
