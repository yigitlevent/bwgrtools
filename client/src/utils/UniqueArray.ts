export type UniqueArrayItem<K, T> = { id: K; } & T;


/**
 * UniqueArray collection can only store objects that has an `id` property.
 * It uses this `id` property to force uniqueness of its elements.
 * Keys of this collections is the type of the `id` property.
 * @param newArray - Optional. Array of objects.
**/
export class UniqueArray<K, T> {
  private values: UniqueArrayItem<K, T>[] = [];

  /**
	 * UniqueArray collection can only store objects that has an `id` property.
	 * It uses this `id` property to force uniqueness of its elements.
	 * Keys of this collections is the type of the `id` property.
	 * @param newArray - Optional. Array of objects.
	**/
  constructor(newArray?: UniqueArrayItem<K, T>[]) {
    if (newArray) {
      const remade: UniqueArrayItem<K, T>[] = JSON.parse(JSON.stringify(newArray)) as UniqueArrayItem<K, T>[];
      remade.forEach(v => this.add(v));
    }
  }

  /**
	 * Returns the underlying array.
	 * @returns `UniqueArrayItem<K, T>[]`
	**/
  get items(): UniqueArrayItem<K, T>[] {
    return this.values;
  }

  /**
	 * Returns the length of the underlying array.
	 * @returns `number`
	**/
  get length(): number {
    return this.values.length;
  }

  /**
	 * Adds a new item to the UniqueArray if the `id` property of the object is not found.
	 * Otherwise it replaces the value of the item with the same `id`.
	 * @param item - `UniqueArrayItem<K, T>`
	 * @returns `UniqueArray<K, T>`
	**/
  add(item: UniqueArrayItem<K, T>): this {
    const index = this.findIndex(item.id);
    if (index !== undefined && index >= 0) this.values[index] = item;
    else this.values.push(item);
    return this;
  }

  /**
	 * Removes specified item from the UniqueArray if the `id` property of the object is found.
	 * @param id - `K`
	 * @returns `UniqueArray<K, T>`
	**/
  remove(id: K): this {
    const index = this.findIndex(id);
    if (index !== undefined && index >= 0) this.values.splice(index, 1);
    return this;
  }

  /**
	 * Returns the item at index.
	 * @param index - `number`
	 * @returns `UniqueArrayItem<K, T>`
	**/
  at(index: number): UniqueArrayItem<K, T> {
    if (index > this.values.length - 1 || this.values.length + index < 0) throw Error("Index out of bounds");
    else if (index < 0) return this.values[this.values.length + index];
    else return this.values[index];
  }

  /**
	 * Returns the first item.
	 * @returns `UniqueArrayItem<K, T>`
	**/
  head(): UniqueArrayItem<K, T> {
    return this.values[0];
  }

  /**
	 * Returns the last item.
	 * @returns `UniqueArrayItem<K, T>`
	**/
  last(): UniqueArrayItem<K, T> {
    return this.values[this.values.length - 1];
  }

  /**
	 * Empties the underlying array.
	 * @returns `UniqueArray<K, T>`
	**/
  clear(): this {
    this.values = [];
    return this;
  }

  /**
	 * Checks if the id already exists in the collection..
	 * @param id - `K`
	 * @returns `boolean`
	**/
  has(id: K): boolean {
    return this.values.some(v => v.id === id);
  }

  /**
	 * Checks if any element with the given `id` satisfies the pair of key-value.
	 * @param id - id of the element `T`.
	 * @param key - key of the element type of `T`.
	 * @param value - value condition for the key of the element type of `T`.
	 * @returns boolean.
	**/
  exists(id: K, key: keyof T, value: T[keyof T]): boolean {
    return this.values.some(v => v.id === id && v[key] === value);
  }

  /**
	 * Returns count of elements which satisfy the specified pair of key-value.
	 * @param key - key of the element type of `T`.
	 * @param value - value condition for the key of the element type of `T`.
	 * @returns count of elements that has this key-value pair.
	**/
  existsAny(key: keyof T, value: T[keyof T]): number {
    return this.values.filter(v => v[key] === value).length;
  }

  /**
	 * Checks if any element with the given `id` satisfies the pair of key and any of the given values.
	 * @param id - id of the element `T`.
	 * @param key - key of the element type of `T`.
	 * @param value - value conditions for the key of the element type of `T`.
	 * @returns boolean.
	**/
  existsWithValues(id: K, key: keyof T, value: T[keyof T][]): boolean {
    return this.values.some(v => v.id === id && value.includes(v[key]));
  }

  /**
	 * Tries to find an item with the provided id.
	 * @param id - Id of the object that is being searched.
	 * @returns Item, or `undefined`.
	**/
  find(id: K): UniqueArrayItem<K, T> | undefined {
    return this.values.find(v => v.id === id);
  }

  /**
	 * Tries to find an index of the item with the provided id.
	 * @param id - Id of the object that is being searched.
	 * @returns Index of the item, or `undefined`.
	**/
  findIndex(id: K): number | undefined {
    return this.values.findIndex(v => v.id === id);
  }

  /**
	 * Calls a defined callback function on each element of an array, and returns an array that contains the results.
	 * @param callback - `(value: UniqueArrayItem<K, T>, index: number, array: UniqueArrayItem<K, T>[]) => R`
	 * @returns `R[]`.
	**/
  map<R>(callback: (value: UniqueArrayItem<K, T>, index: number, array: UniqueArrayItem<K, T>[]) => R): R[] {
    return this.values.map(callback);
  }

  /**
	 * Performs the specified action for each element in an array.
	 * @param callback - `(value: UniqueArrayItem<K, T>, index: number, array: UniqueArrayItem<K, T>[]) => void`
	 * @returns `void`.
	**/
  forEach(callback: (value: UniqueArrayItem<K, T>, index: number, array: UniqueArrayItem<K, T>[]) => void): void {
    this.values.forEach(callback);
  }

  /**
	 * Returns the elements of an array that meet the condition specified in a callback function..
	 * @param callback - `(value: UniqueArrayItem<K, T>, index: number, array: UniqueArrayItem<K, T>[]) => boolean`
	 * @returns `UniqueArrayItem<K, T>[]`.
	**/
  filter(callback: (value: UniqueArrayItem<K, T>, index: number, array: UniqueArrayItem<K, T>[]) => boolean): UniqueArrayItem<K, T>[] {
    return this.values.filter(callback);
  }
}
