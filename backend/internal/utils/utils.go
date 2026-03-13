package utils

import "time"

func ConvertStringDate(strDate string) (time.Time, error) {
	loc, err := time.LoadLocation("America/Sao_Paulo")
	if err != nil {
		loc = time.UTC
	}

	newDate, err := time.ParseInLocation("2006-01-02", strDate, loc)
	if err != nil {
		return time.Time{}, err // Retorna o erro para quem chamou
	}

	return newDate, nil
}
