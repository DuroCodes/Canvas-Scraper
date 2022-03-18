/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import * as Table from 'cli-table3';
import { prompt } from 'inquirer';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import {
  green,
  yellow,
  blue,
  red,
} from 'chalk';
import {
  QuestionAnswer,
  Course,
  Headers,
  Module,
  Assignment,
  ModuleItems,
} from './interfaces';

dotenv.config();

const tableSymbols: Table.TableConstructorOptions = {
  chars: {
    top: '━',
    'top-mid': '┳',
    'top-left': '┏',
    'top-right': '┓',
    bottom: '━',
    'bottom-mid': '┻',
    'bottom-left': '┗',
    'bottom-right': '┛',
    left: '┃',
    'left-mid': '┣',
    mid: '━',
    'mid-mid': '╋',
    right: '┃',
    'right-mid': '┫',
    middle: '┃',
  },
};

const link: string = `https://${process.env.CANVAS_PREFIX}.instructure.com/api/v1/courses`;
const headers: Headers = {
  headers:
  {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
};

async function getJSON(url: string) {
  const res = await fetch(url, headers);
  const json = await res.json();
  return json;
}

async function getCourses() {
  const json: Course[] = await getJSON(`${link}?per_page=100`);
  const courses: string[] = [];

  json.forEach((course: Course) => {
    if (course.name && course.id) {
      courses.push(`${course.id}`);
    }
  });

  return courses;
}

async function getModules(courseId: string) {
  const json: Module[] = await getJSON(`${link}/${courseId}/modules`);
  const modules: string[] = [];

  json.forEach((mod: Module) => {
    if (mod.name && mod.id) {
      modules.push(`${mod.id}`);
    }
  });

  return modules;
}

async function getCoursesTable() {
  const json: Course[] = await getJSON(`${link}?per_page=100`);

  const table = new Table({
    ...tableSymbols,
    head: ['Course Name', 'Course ID'],
  });

  json.forEach((course: Course) => {
    if (course.name && course.id) {
      table.push([
        green(course.name),
        yellow(course.id),
      ]);
      table.sort((a, b) => a[1].localeCompare(b[1]));
    }
  });

  return process.stdout.write(`${table.toString()}\n`);
}

async function getAssignmentsTable() {
  const courses: string[] = await getCourses();

  prompt({
    type: 'input',
    name: 'courseId',
    message: 'Enter the Course ID:',
    validate: (value: string) => ((courses.includes(value)) ? true : 'Course ID not found'),
  }).then(async (answer: QuestionAnswer) => {
    const { courseId } = answer;
    const json = await getJSON(`${link}/${courseId}/assignments`);

    if (json.length < 1) {
      process.stderr.write('No assignments found.\n');
      return process.exit(1);
    }

    const table = new Table({
      ...tableSymbols,
      head: ['Assignment Name', 'Assignment ID', 'Due Date'],
    });

    json.forEach((assignment: Assignment) => {
      if (assignment.name && assignment.id) {
        table.push([
          green(assignment.name),
          yellow(assignment.id),
          blue((assignment.due_at) ? new Date(assignment.due_at).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'No Due Date'),
        ]);
        table.sort((a, b) => b[2].localeCompare(a[2]));
      }
    });

    return process.stdout.write(`${table.toString()}\n`);
  });
}

async function getModulesTable() {
  const courses: string[] = await getCourses();

  prompt({
    type: 'input',
    name: 'courseId',
    message: 'Enter the Course ID:',
    validate: (value: string) => ((courses.includes(value)) ? true : 'Course ID not found'),
  }).then(async (answer: QuestionAnswer) => {
    const { courseId } = answer;
    const json: Module[] = await getJSON(`${link}/${courseId}/modules`);

    const table = new Table({
      ...tableSymbols,
      head: ['Module Name', 'Module ID', 'Item Count'],
    });

    if (json.length < 1) {
      process.stderr.write('No courses found.\n');
      return process.exit(1);
    }

    json.forEach((mod: Module) => {
      table.push([
        green(mod.name),
        yellow(mod.id),
        blue(mod.items_count),
      ]);

      table.sort((a, b) => b[1].localeCompare(a[1]));
    });

    return process.stdout.write(`${table.toString()}\n`);
  });
}

async function getModuleItems() {
  const courses: string[] = await getCourses();

  prompt({
    type: 'input',
    name: 'courseId',
    message: 'Enter the Course ID:',
    validate: (value: string) => ((courses.includes(value)) ? true : 'Course ID not found'),
  }).then(async (answer: QuestionAnswer) => {
    const { courseId } = answer;
    const modules: string[] = await getModules(courseId);

    prompt({
      type: 'input',
      name: 'moduleId',
      message: 'Enter the Module ID:',
      validate: (value: string) => ((modules.includes(value)) ? true : 'Module ID not found'),
    }).then(async (answer2: QuestionAnswer) => {
      const { moduleId } = answer2;
      const json: Module[] = await getJSON(`${link}/${courseId}/modules/${moduleId}/items`);
      const json2: ModuleItems = await getJSON(`${link}/${courseId}/modules/${moduleId}`);

      const table = new Table(
        {
          chars: {
            top: '━',
            'top-mid': '┳',
            'top-left': '┣',
            'top-right': '┫',
            bottom: '━',
            'bottom-mid': '┻',
            'bottom-left': '┗',
            'bottom-right': '┛',
            left: '┃',
            'left-mid': '┣',
            mid: '━',
            'mid-mid': '╋',
            right: '┃',
            'right-mid': '┫',
            middle: '┃',
          },
          head: ['Item Title', 'Item Type', 'Item ID'],
          colWidths: [50, 20, 20],
        },
      );
      const header = new Table(
        {
          chars: {
            top: '━',
            'top-mid': '┳',
            'top-left': '┏',
            'top-right': '┓',
            bottom: '',
            'bottom-mid': '',
            'bottom-left': '',
            'bottom-right': '',
            left: '┃',
            'left-mid': '┣',
            mid: '━',
            'mid-mid': '╋',
            right: '┃',
            'right-mid': '┫',
            middle: '┃',
          },
          head: [red.bold(json2.name)],
          colWidths: [92],
          colAligns: ['center'],
        },
      );

      if (json.length < 1) {
        process.stderr.write('No items found.\n');
        return process.exit(1);
      }

      json.forEach((item: any) => {
        table.push([
          green(item.title),
          yellow(item.type),
          blue(item.id),
        ]);
        table.sort((a, b) => b[2].localeCompare(a[2]));
      });

      return process.stdout.write(`${header}\n${table.toString()}\n`);
    });
  });
}

prompt({
  name: 'choice',
  type: 'list',
  message: 'Which mode would you like to use?',
  choices: [
    '[1] Get Courses',
    '[2] Get Assignments',
    '[3] Get Modules',
    '[4] Get Module Items',
  ],
}).then((answer: QuestionAnswer) => {
  switch (answer.choice) {
    case '[1] Get Courses':
      getCoursesTable();
      break;
    case '[2] Get Assignments':
      getAssignmentsTable();
      break;
    case '[3] Get Modules':
      getModulesTable();
      break;
    case '[4] Get Module Items':
      getModuleItems();
      break;
    default:
      process.stderr.write('Not implemented yet!\n');
  }
});
