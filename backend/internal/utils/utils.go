package utils

import "time"

func ConvertStringDate(strDate string) (time.Time, error) {

	loc, _ := time.LoadLocation("America/Sao_Paulo")
	newDate, _ := time.ParseInLocation("2006-01-02", strDate, loc)
	return newDate, nil
}
