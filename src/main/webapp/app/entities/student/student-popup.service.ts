import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HttpResponse } from '@angular/common/http';
import { Student } from './student.model';
import { StudentService } from './student.service';

@Injectable()
export class StudentPopupService {
    private ngbModalRef: NgbModalRef;

    constructor(
        private modalService: NgbModal,
        private router: Router,
        private studentService: StudentService

    ) {
        this.ngbModalRef = null;
    }

    open(component: Component, id?: number | any): Promise<NgbModalRef> {
        return new Promise<NgbModalRef>((resolve, reject) => {
            const isOpen = this.ngbModalRef !== null;
            if (isOpen) {
                resolve(this.ngbModalRef);
            }

            if (id) {
                this.studentService.find(id)
                    .subscribe((studentResponse: HttpResponse<Student>) => {
                        const student: Student = studentResponse.body;
                        if (student.dob) {
                            student.dob = {
                                year: student.dob.getFullYear(),
                                month: student.dob.getMonth() + 1,
                                day: student.dob.getDate()
                            };
                        }
                        this.ngbModalRef = this.studentModalRef(component, student);
                        resolve(this.ngbModalRef);
                    });
            } else {
                // setTimeout used as a workaround for getting ExpressionChangedAfterItHasBeenCheckedError
                setTimeout(() => {
                    this.ngbModalRef = this.studentModalRef(component, new Student());
                    resolve(this.ngbModalRef);
                }, 0);
            }
        });
    }

    studentModalRef(component: Component, student: Student): NgbModalRef {
        const modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.student = student;
        modalRef.result.then((result) => {
            this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true, queryParamsHandling: 'merge' });
            this.ngbModalRef = null;
        }, (reason) => {
            this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true, queryParamsHandling: 'merge' });
            this.ngbModalRef = null;
        });
        return modalRef;
    }
}
