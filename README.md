# Why?
Sometimes you want to deep mutate.

# Example

```ts
import {update} from "copy-machine";

  state = update(state, {
    posts: update(
      0, update<Post>({
        author: "Eric",
      }),
    ),
  });
```