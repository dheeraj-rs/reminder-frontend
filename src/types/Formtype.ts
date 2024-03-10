export interface Formtype {
  date: any;
  title: string;
  time: string;
  startTime: string;
  endTime: string;
  icon: string;
  color: string;
  details: readonly string[];
  pinned: boolean;
  personal: boolean;
  [x: string]: any;
}

export interface valtioDataType {
  userId: string;
  taskData: Formtype[];
  calenderDate: Date | null;
  formToggle: boolean | null;
  selectedData: Formtype | null;
}

export interface loginType {
  email: string;
  password: string;
}

export interface registerType {
  email: string;
  password: string;
  username: string;
}
