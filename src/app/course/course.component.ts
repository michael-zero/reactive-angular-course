import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Course} from '../model/course';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay,
  map,
  concatMap,
  switchMap,
  withLatestFrom,
  concatAll, shareReplay, catchError
} from 'rxjs/operators';
import {merge, fromEvent, Observable, concat, throwError, combineLatest, scheduled, asyncScheduler, of} from 'rxjs';
import {Lesson} from '../model/lesson';
import { CoursesService } from '../services/courses.service';

interface CourseData {
  course: Course;
  lessons: Lesson[]
}

@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseComponent implements OnInit {

  data$: Observable<CourseData>;

  constructor(private route: ActivatedRoute, private _courseService: CoursesService) {}

  ngOnInit() {

    const courseId = parseInt(this.route.snapshot.paramMap.get('courseId'));

    const course$ =  scheduled([
      of(null),
      this._courseService.loadCourseById(courseId)
    ], asyncScheduler).pipe(concatAll());

    const lessons$ = scheduled([
      of(null),
      this._courseService.loadAllCoursesLessons(courseId)
    ], asyncScheduler).pipe(concatAll());

    this.data$ = combineLatest([course$, lessons$])
    .pipe(map(([course, lessons]) => {
      return {
        course,
        lessons
      }
    } ),
      tap(data => console.log(data))
  )

  }


}











