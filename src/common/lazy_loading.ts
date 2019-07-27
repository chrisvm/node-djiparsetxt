export interface ILazyLoadingEntry<t = any> {
	instance: t | null;
	factory: (options?: any) => t;
}
