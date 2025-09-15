import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, Clock, Star, Search, Filter, Play, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
// AutoTranslate import removed for fast loading
import { useLanguage } from "@/contexts/LanguageContext";

export default function Courses() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return apiRequest("POST", `/api/courses/${courseId}/enroll`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Enrollment Successful!",
        description: "You have been enrolled in the course successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: t("enrollmentFailed"),
        description: error.message || t("failedToEnrollInCourse"),
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredCourses = Array.isArray(courses) ? courses.filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;
    const matchesLanguage = languageFilter === "all" || course.teachingLanguage === languageFilter;
    return matchesSearch && matchesLevel && matchesLanguage;
  }) : [];

  const levelColors = {
    beginner: { bg: "bg-green-500/20", text: "text-green-500", border: "border-green-500/30" },
    intermediate: { bg: "bg-yellow-500/20", text: "text-yellow-500", border: "border-yellow-500/30" },
    expert: { bg: "bg-red-500/20", text: "text-red-500", border: "border-red-500/30" },
  };

  const handleEnroll = (courseId: string) => {
    if (!localStorage.getItem("token")) {
      toast({
        title: t("loginRequired"),
        description: t("pleaseLoginToEnrollInCourses"),
        variant: "destructive",
      });
      return;
    }

    enrollMutation.mutate(courseId);
  };

  return (
    <div className="min-h-screen pt-16 pb-16" data-testid="courses-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 neon-text text-primary animate-float" data-testid="courses-title">
            "Astrology Courses"
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            "Master the ancient wisdom of Vedic astrology with comprehensive courses designed for all levels. Learn from expert astrologer Arup Shastri with 18+ years of experience."
          </p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("searchCoursesByTitle")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input w-full"
                data-testid="search-courses"
              />
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="form-input w-full lg:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t("level")} />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">{t("allLevels")}</SelectItem>
                  <SelectItem value="beginner">{t("beginner")}</SelectItem>
                  <SelectItem value="intermediate">{t("intermediate")}</SelectItem>
                  <SelectItem value="expert">{t("expert")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="form-input w-full lg:w-40">
                  <SelectValue placeholder={t("language")} />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">{t("allLanguages")}</SelectItem>
                  <SelectItem value="en">{t("english")}</SelectItem>
                  <SelectItem value="hi">{t("hindi")}</SelectItem>
                  <SelectItem value="bn">{t("bengali")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <GlassCard className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-primary neon-border rounded-full p-2 mx-auto mb-3" style={{ 
              filter: 'drop-shadow(0 0 8px hsl(42, 92%, 56%))',
              background: 'rgba(255, 193, 7, 0.1)'
            }} />
            <div className="text-2xl font-bold text-primary mb-2">{Array.isArray(courses) ? courses.length : 0}</div>
            <div className="text-sm text-muted-foreground">{t("totalCourses")}</div>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <Users className="w-8 h-8 text-secondary neon-border rounded-full p-2 mx-auto mb-3" style={{ 
              filter: 'drop-shadow(0 0 8px hsl(195, 100%, 50%))',
              background: 'rgba(0, 191, 255, 0.1)'
            }} />
            <div className="text-2xl font-bold text-secondary mb-2">
              {Array.isArray(courses) ? courses.reduce((total: number, course: any) => total + (course.currentStudents || 0), 0) : 0}
            </div>
            <div className="text-sm text-muted-foreground">{t("activeStudents")}</div>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <Clock className="w-8 h-8 text-primary neon-border rounded-full p-2 mx-auto mb-3" style={{ 
              color: 'hsl(42, 92%, 56%)', 
              filter: 'drop-shadow(0 0 8px hsl(42, 92%, 56%))',
              background: 'rgba(255, 193, 7, 0.1)'
            }} />
            <div className="text-2xl font-bold text-primary neon-text mb-2" style={{ 
              color: 'hsl(42, 92%, 56%)', 
              textShadow: '0 0 10px hsl(42, 92%, 56%)' 
            }}>50+</div>
            <div className="text-sm text-muted-foreground">{t("hoursOfContent")}</div>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 neon-border rounded-full p-2 mx-auto mb-3" style={{ 
              filter: 'drop-shadow(0 0 8px #fbbf24)',
              background: 'rgba(251, 191, 36, 0.1)'
            }} />
            <div className="text-2xl font-bold text-yellow-500 mb-2">4.9</div>
            <div className="text-sm text-muted-foreground">{t("averageRating")}</div>
          </GlassCard>
        </div>

        {/* Courses Grid */}
        {!Array.isArray(filteredCourses) || filteredCourses.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-4">{t("noCoursesFound")}</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? t("tryAdjustingSearchCriteria") : t("coursesAvailableSoon")}
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setLevelFilter("all");
              setLanguageFilter("all");
            }} className="glass">
              Clear Filters
            </Button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course: any, index: number) => {
              const levelStyle = levelColors[course.level as keyof typeof levelColors];
              const progressPercentage = (course.currentStudents / course.maxStudents) * 100;
              
              return (
                <GlassCard 
                  key={course.id} 
                  className="p-0 overflow-hidden hover:scale-105 transition-transform duration-300"
                  data-testid={`course-card-${index}`}
                >
                  {/* Course Image/Video Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Play className="w-12 h-12 text-primary/60" />
                    <div className="absolute top-4 left-4">
                      <Badge className={`${levelStyle.bg} ${levelStyle.text} ${levelStyle.border}`}>
                        {course.level}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="glass text-xs">
                        {course.teachingLanguage?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Course Title & Description */}
                    <h3 className="text-xl font-bold mb-3 text-foreground" data-testid={`course-title-${index}`}>
                      <AutoTranslate text={course.title} />
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm line-clamp-3" data-testid={`course-description-${index}`}>
                      <AutoTranslate text={course.description} />
                    </p>

                    {/* Course Info */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {course.currentStudents}/{course.maxStudents} students
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">(4.9)</span>
                        </div>
                      </div>

                      {/* Enrollment Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Enrollment Progress</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full bg-muted/30 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Course Features */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Self-paced
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Certificate
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Lifetime Access
                        </Badge>
                      </div>
                    </div>

                    {/* Modules Preview */}
                    {course.modules && course.modules.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-foreground mb-2">What you'll learn:</h4>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {course.modules.slice(0, 3).map((module: any, moduleIndex: number) => (
                            <li key={moduleIndex} className="flex items-center">
                              <ChevronRight className="w-3 h-3 mr-1 text-primary" />
                              {module.title}
                            </li>
                          ))}
                          {course.modules.length > 3 && (
                            <li className="text-primary text-xs">
                              +{course.modules.length - 3} more modules
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Price & Enroll Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-primary" data-testid={`course-price-${index}`}>
                          ₹{parseFloat(course.price).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">One-time payment</div>
                      </div>
                      
                      {course.currentStudents >= course.maxStudents ? (
                        <Button disabled className="opacity-50">
                          Course Full
                        </Button>
                      ) : (
                        <NeonButton
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollMutation.isPending}
                          size="sm"
                          data-testid={`enroll-button-${index}`}
                        >
                          {enrollMutation.isPending ? t("enrolling") : t("enrollNow")}
                        </NeonButton>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16">
          <GlassCard className="p-8 md:p-12 text-center neon-border">
            <h3 className="text-3xl font-bold mb-4 text-primary">
              Ready to Begin Your Astrological Journey?
            </h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of students worldwide who have transformed their understanding of the cosmos 
              with expert guidance from Astrologer Arup Shastri.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <NeonButton size="lg" className="text-lg px-8 py-4">
                  Book Personal Consultation
                </NeonButton>
              </Link>
              <Link href="/products">
                <Button variant="outline" size="lg" className="glass text-lg px-8 py-4">
                  Explore Remedies
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
