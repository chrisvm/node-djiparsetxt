import { ICommand } from "./ICommand";
import { ServiceManager } from "../ServiceManager";
import { FilesService } from "../services/FilesService";

export class PrintHeaderCommand implements ICommand {
	constructor() {}

	public exec(service_man: ServiceManager): void {
		const files_service = service_man.get_service("files") as FilesService;
		if (files_service) {
			files_service.files(file => {
        console.log(file);
      });
		}
	}
}
