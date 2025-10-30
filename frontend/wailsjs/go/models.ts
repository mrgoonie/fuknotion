export namespace models {
	
	export class Note {
	    id: string;
	    workspaceId: string;
	    title: string;
	    content: string;
	    parentId?: string;
	    isFavorite: boolean;
	    isDeleted: boolean;
	    createdAt: string;
	    updatedAt: string;
	    deletedAt?: string;
	
	    static createFrom(source: any = {}) {
	        return new Note(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.workspaceId = source["workspaceId"];
	        this.title = source["title"];
	        this.content = source["content"];
	        this.parentId = source["parentId"];
	        this.isFavorite = source["isFavorite"];
	        this.isDeleted = source["isDeleted"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	        this.deletedAt = source["deletedAt"];
	    }
	}
	export class Workspace {
	    id: string;
	    name: string;
	    createdAt: string;
	    updatedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Workspace(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.createdAt = source["createdAt"];
	        this.updatedAt = source["updatedAt"];
	    }
	}

}

