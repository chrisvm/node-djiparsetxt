export interface ILazyLoadingEntry<t>
{
	instance: t | null;
	factory: (options?: any) => t;
}