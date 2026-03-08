package utils

import "time"

func ConvertStringDate(strDate string) (time.Time, error) {

	loc, _ := time.LoadLocation("America/Fortaleza")
	newDate, _ := time.ParseInLocation("2006-01-02", strDate, loc)
	return newDate, nil
}
