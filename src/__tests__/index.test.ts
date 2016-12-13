import {assign as assign} from "../";

type Person = {
  name: string;
  kids?: Person[];
};

type Group = {
  people: Person[];
};

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
  const b = assign(a, {foo: "baz"});

  expect(b).not.toBe(a);
  expect(b.foo).toBe("baz");
});

test("array case", () => {
  const arr = ["foo", "bar", "baz"];

  const sameArr = assign(arr, 1, "bar");
  const newArr = assign(arr, 1, "bleh");

  expect(sameArr).toBe(arr);
  expect(newArr).not.toBe(arr);
  expect(newArr.length).toBe(3);
  expect(newArr).toEqual(["foo", "bleh", "baz"]);
});

test("it works", () => {
  const newFamily = assign(family, {
    people: (p) => assign(p, 0, (bob) => {
      return assign(bob, {
        name: "Robert",
      });
    }),
  });

  expect(newFamily).not.toBe(family);
  expect(newFamily.people[0].kids).toBe(family.people[0].kids);
  expect(newFamily.people[0].name).toBe("Robert");
});

test("clean syntax", () => {
  const newFamily = assign(family, {
    people: assign(0, assign({
        name: "Robert",
      }),
    ),
  });

  expect(newFamily).not.toBe(family);
  expect(newFamily.people[0].kids).toBe(family.people[0].kids);
  expect(newFamily.people[0].name).toBe("Robert");
});

test("clean syntax keeps value equals", () => {
  const newFamily = assign(family, {
    people: assign(0, assign({
        name: "Romeo",
      }),
    ),
  });

  expect(newFamily).toBe(family);
});

test("arrays work with searcher", () => {
  const findRomeo = (p: Person) => p.name === "romeo";
  const newFamily = assign(family, {
    people: assign(findRomeo, assign({
        name: "Romeo",
      }),
    ),
  });

  expect(newFamily).toBe(family);
});
