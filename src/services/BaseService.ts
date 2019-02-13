import { ServiceManager } from "../ServiceManager";

export default abstract class BaseService
{
  protected service_man: ServiceManager;

  constructor(service_man: ServiceManager)
  {
    this.service_man = service_man;
  }

  public abstract name: string;
}