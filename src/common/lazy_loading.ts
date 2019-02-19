export interface ILazyLoadingEntry<t>
{
	instance: t | null;
	factory: () => t;
}