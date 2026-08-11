import { useMemo } from 'react';
import { useProgress } from './useProgress';
import { getCourseData } from '../data/index';

export const useCourseData = () => {
  const { progress } = useProgress();
  const activeCourse = progress?.activeCourse || 'en-pt';
  return useMemo(() => getCourseData(activeCourse), [activeCourse]);
};

export default useCourseData;
