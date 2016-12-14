import {update as update} from "../";

type Person = {
  name: string;
  kids?: Person[];
};

type Group = {
  people: Person[];
};

interface Blog {
  posts: Post[];
}

interface Content {
  author: string;
  content: string;
  datetime: number;
}

interface Post extends Content {
  title: string;
  comments: Content[];
}

const family: Group = {
  people: [
    {
      kids: [{
        name: "Jane",
      }],
      name: "Romeo",
    },
    {
      kids: [{
        name: "Steve",
      }],
      name: "Juliet",
    },
  ],
};

test("simple case", () => {
  const a = {
    foo: "bar",
    zbleh: {
      blerg: "stuff",
    },
  };
  const b = update(a, {foo: "baz"});

  expect(b).not.toBe(a);
  expect(b.foo).toBe("baz");
});

test("array case", () => {
  const arr = ["foo", "bar", "baz"];

  const sameArr = update(arr, 1, "bar");
  const newArr = update(arr, 1, "bleh");

  expect(sameArr).toBe(arr);
  expect(newArr).not.toBe(arr);
  expect(newArr.length).toBe(3);
  expect(newArr).toEqual(["foo", "bleh", "baz"]);
});

test("it works", () => {
  const newFamily = update(family, {
    people: (p) => update(p, 0, (bob) => {
      return update(bob, {
        name: "Robert",
      });
    }),
  });

  expect(newFamily).not.toBe(family);
  expect(newFamily.people[0].kids).toBe(family.people[0].kids);
  expect(newFamily.people[0].name).toBe("Robert");
});

test("clean syntax", () => {
  const newFamily = update(family, {
    people: update(0, update({
        name: "Robert",
      }),
    ),
  });

  expect(newFamily).not.toBe(family);
  expect(newFamily.people[0].kids).toBe(family.people[0].kids);
  expect(newFamily.people[0].name).toBe("Robert");
});

test("clean syntax keeps value equals", () => {
  const newFamily = update(family, {
    people: update(
      0, update({
        name: "Romeo",
      }),
    ),
  });

  expect(newFamily).toBe(family);
});

test("arrays work with searcher", () => {
  const findRomeo = (p: Person) => p.name === "romeo";
  const newFamily = update(family, {
    people: update(
      findRomeo, update({
        name: "Romeo",
      }),
    ),
  });

  expect(newFamily).toBe(family);
});

test("complex case", () => {
  let state: Blog = {
    posts: [
      {
        author: "EA",
        content: "Hello World",
        datetime: 1481723342779,
        title: "Hello World",
        comments: [
          {
            author: "John Doe",
            content: "Sweet blog",
            datetime: 1481723342779,
          },
        ],
      },
    ],
  };

  // Set the author of the first post to "Eric"
  state = update(state, {
    posts: update(
      0, update<Post>({
        author: "Eric",
      }),
    ),
  });

});
