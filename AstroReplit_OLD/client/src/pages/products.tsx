import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Star, Gem, Scroll, Droplets, BookOpen, Gift, ShoppingCart, Filter } from "lucide-react";
// AutoTranslate import removed for fast loading
import { useLanguage } from "@/contexts/LanguageContext";

export default function Products() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredProducts = Array.isArray(products) ? products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    let matchesPrice = true;
    if (priceFilter !== "all") {
      const price = parseFloat(product.price);
      switch (priceFilter) {
        case "under-1000":
          matchesPrice = price < 1000;
          break;
        case "1000-5000":
          matchesPrice = price >= 1000 && price <= 5000;
          break;
        case "over-5000":
          matchesPrice = price > 5000;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  }) : [];

  const categories = [
    { 
      value: "all", 
      label: t("allProducts"), 
      icon: Package,
      description: t("browseAllCosmicRemedies")
    },
    { 
      value: "gemstones", 
      label: t("gemstones"), 
      icon: Gem,
      description: t("authenticCertifiedGemstones")
    },
    { 
      value: "yantras", 
      label: t("sacredYantras"), 
      icon: Scroll,
      description: t("energizedGeometricPatterns")
    },
    { 
      value: "malas", 
      label: t("spiritualMalas"), 
      icon: Droplets,
      description: t("rudrakshaGemstoneForMeditation")
    },
    { 
      value: "books", 
      label: t("astrologyBooks"), 
      icon: BookOpen,
      description: t("comprehensiveAncientWisdom")
    },
    { 
      value: "kits", 
      label: t("remedyKits"), 
      icon: Gift,
      description: t("completePersonalizedRemedySolutions")
    },
  ];

  const categoryColors = {
    gemstones: { bg: "bg-purple-500/20", text: "text-purple-500", accent: "from-purple-500 to-pink-500" },
    yantras: { bg: "bg-yellow-500/20", text: "text-yellow-500", accent: "from-yellow-500 to-orange-500" },
    malas: { bg: "bg-green-500/20", text: "text-green-500", accent: "from-green-500 to-emerald-500" },
    books: { bg: "bg-blue-500/20", text: "text-blue-500", accent: "from-blue-500 to-cyan-500" },
    kits: { bg: "bg-red-500/20", text: "text-red-500", accent: "from-red-500 to-rose-500" },
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData ? categoryData.icon : Package;
  };

  return (
    <div className="min-h-screen pt-16 pb-16" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 neon-text text-primary animate-float" data-testid="products-title">
            "Cosmic Remedies"
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            "Authentic astrological products, gemstones, and spiritual accessories to enhance your cosmic journey. Each item is carefully selected and energized by Astrologer Arup Shastri."
          </p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("searchProductsByName")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input w-full"
                data-testid="search-products"
              />
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="form-input w-full lg:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t("category")} />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="form-input w-full lg:w-40">
                  <SelectValue placeholder={t("price")} />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">{t("allPrices")}</SelectItem>
                  <SelectItem value="under-1000">{t("under1000")}</SelectItem>
                  <SelectItem value="1000-5000">{t("from1000To5000")}</SelectItem>
                  <SelectItem value="over-5000">{t("over5000")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.slice(1).map((category, index) => {
            const CategoryIcon = category.icon;
            const colors = categoryColors[category.value as keyof typeof categoryColors];
            const productCount = Array.isArray(products) ? products.filter((p: any) => p.category === category.value).length : 0;
            
            return (
              <GlassCard 
                key={category.value}
                className="p-6 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setCategoryFilter(category.value)}
                data-testid={`category-${category.value}`}
              >
                <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
                  <CategoryIcon className={`w-8 h-8 ${colors.text}`} />
                </div>
                <h3 className="text-lg font-bold text-center mb-2 text-foreground">
                  {category.label}
                </h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {category.description}
                </p>
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {productCount} {t("products")}
                  </Badge>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Featured Product Banner */}
        <GlassCard className="p-8 md:p-12 mb-12 neon-border">
          <div className="text-center">
            <Gift className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4 text-primary">
              Complete Remedy Kit
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get a personalized remedy kit based on your birth chart analysis. Includes gemstones, yantra, 
              and detailed guidance tailored specifically for you.
            </p>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="text-3xl font-bold text-primary">₹9,999</div>
              <div className="text-lg text-muted-foreground line-through">₹15,000</div>
              <Badge className="bg-red-500/20 text-red-500">33% OFF</Badge>
            </div>
            <Link href="/booking">
              <NeonButton size="lg" className="text-lg px-8 py-4">
                Order Custom Kit
              </NeonButton>
            </Link>
          </div>
        </GlassCard>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-foreground mb-4">{t("noProductsFound")}</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? t("tryAdjustingSearchCriteria") : t("productsAvailableSoon")}
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setPriceFilter("all");
            }} className="glass">
              Clear Filters
            </Button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product: any, index: number) => {
              const CategoryIcon = getCategoryIcon(product.category);
              const colors = categoryColors[product.category as keyof typeof categoryColors];
              
              return (
                <GlassCard 
                  key={product.id} 
                  className="p-0 overflow-hidden hover:scale-105 transition-transform duration-300"
                  data-testid={`product-card-${index}`}
                >
                  {/* Product Image */}
                  <div className={`relative h-48 bg-gradient-to-br ${colors?.accent || 'from-primary to-secondary'} flex items-center justify-center`}>
                    <CategoryIcon className="w-16 h-16 text-white/80" />
                    <div className="absolute top-4 right-4">
                      <Badge className={colors?.bg ? `${colors.bg} ${colors.text}` : "bg-primary/20 text-primary"}>
                        {product.category}
                      </Badge>
                    </div>
                    {product.stock && product.stock <= 5 && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="destructive" className="text-xs">
                          Only {product.stock} left
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Product Info */}
                    <h3 className="text-lg font-bold mb-2 text-foreground" data-testid={`product-name-${index}`}>
                      <AutoTranslate text={product.name} />
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm line-clamp-3" data-testid={`product-description-${index}`}>
                      <AutoTranslate text={product.description} />
                    </p>

                    {/* Specifications */}
                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                      <div className="mb-4 space-y-1">
                        {Object.entries(product.specifications).slice(0, 2).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-muted-foreground capitalize">{key}:</span>
                            <span className="text-foreground">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ratings */}
                    <div className="flex items-center space-x-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold text-primary" data-testid={`product-price-${index}`}>
                          ₹{parseFloat(product.price).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.currency !== "INR" && `${product.currency} pricing available`}
                        </div>
                      </div>
                      
                      <NeonButton size="sm" data-testid={`add-to-cart-${index}`}>
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </NeonButton>
                    </div>

                    {/* Quick Features */}
                    <div className="flex flex-wrap gap-1 mt-4">
                      <Badge variant="outline" className="text-xs">Authentic</Badge>
                      <Badge variant="outline" className="text-xs">Energized</Badge>
                      {product.category === "gemstones" && (
                        <Badge variant="outline" className="text-xs">Certified</Badge>
                      )}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-16">
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-center mb-8 text-primary">
              Why Choose Our Products?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Authentic & Certified</h4>
                <p className="text-sm text-muted-foreground">
                  All gemstones come with authentic certificates and our products are carefully sourced.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gem className="w-8 h-8 text-secondary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Energized by Expert</h4>
                <p className="text-sm text-muted-foreground">
                  Every product is personally energized and blessed by Astrologer Arup Shastri.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Global Shipping</h4>
                <p className="text-sm text-muted-foreground">
                  Secure packaging and worldwide shipping with tracking for all orders.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <GlassCard className="p-8 md:p-12 text-center neon-border">
            <h3 className="text-3xl font-bold mb-4 text-primary">
              Need Personalized Guidance?
            </h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
              Not sure which products are right for you? Book a consultation with Astrologer Arup Shastri 
              to get personalized recommendations based on your birth chart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <NeonButton size="lg" className="text-lg px-8 py-4">
                  Book Consultation
                </NeonButton>
              </Link>
              <Link href="/courses">
                <NeonButton variant="secondary" size="lg" className="text-lg px-8 py-4">
                  Learn Astrology
                </NeonButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
