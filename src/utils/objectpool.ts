export type CreateFn<Entity> = () => Entity;
export type ResetFn<Entity> = (entity: Entity) => void;

export class ObjectPool<Entity> {
  createFn: CreateFn<Entity>;
  resetFn: ResetFn<Entity>;
  pool: Entity[];
  inUse: Entity[];

  constructor(
    createFn: CreateFn<Entity>,
    resetFn: ResetFn<Entity>,
    initialSize: number = 10
  ) {
    this.createFn = createFn; // Function to create a new object
    this.resetFn = resetFn; // Function to reset an object before reuse
    this.pool = [];
    this.inUse = []; // Array to keep track of objects currently in use
    // Pre-fill the pool with initial objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): Entity {
    // Check if there are any available objects in the pool
    // nb caution: use of non-null assertion operator here
    const obj = this.pool.length > 0 ? this.pool.pop()! : this.createFn();

    this.inUse.push(obj); // Add the object to the in-use list
    // console.log({ pool: this.pool.length });
    // console.log({ inUse: this.inUse.length });
    return obj;
  }

  release(obj: Entity) {
    // Reset the object and return it to the pool
    this.resetFn(obj);
    this.inUse = this.inUse.filter((o) => o !== obj); // Remove from in-use list (bit slow)
    this.pool.push(obj);
  }

  releaseAll() {
    // Reset all objects in the pool
    // for (const obj of this.pool) {
    //   this.resetFn(obj);
    // }
    this.pool = this.pool.concat(this.inUse);
    this.inUse = [];
    // console.log({ rpool: this.pool.length });
    // console.log({ rinUse: this.inUse.length });
  }
}
