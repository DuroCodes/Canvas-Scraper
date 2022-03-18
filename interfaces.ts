export interface Headers {
  headers: {
    Authorization: string;
  };
}

export interface QuestionAnswer {
  choice?: string;
  courseId?: string;
  moduleId?: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Module {
  id: string;
  name: string;
  items_count: number;
}

export interface Assignment {
  id: string;
  name: string;
  due_at?: string;
}

export interface ModuleItems {
  id: string;
  type: string;
  name: string;
}
